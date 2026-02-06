using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Models.SharedTables;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;

namespace RS1_2024_25.API.Endpoints.SemesterEndpoints
{
    [Route("students")]
    public class SemesterInsertEndpoint(ApplicationDbContext db, IMyAuthService authService) : MyEndpointBaseAsync
        .WithRequest<SemesterCreateRequest>
        .WithActionResult
    {
        [HttpPost("{studentID}/semesters")]
        public override async Task<ActionResult> HandleAsync([FromBody] SemesterCreateRequest request, CancellationToken cancellationToken = default)
        {
            var recordedBy = authService.GetAuthInfoFromRequest();
            var student = await db.StudentsAll.FindAsync(request.StudentID, cancellationToken);
            var academicYear = await db.AcademicYears.FindAsync(request.AcademicYearID, cancellationToken);

            if (recordedBy == null || academicYear == null || student == null)
                return BadRequest("Student, academic year or logged user not found");

            var semesters = await db.SemestersAll
                .Include(s => s.AcademicYear)
                .Where(s => s.StudentID == request.StudentID)
                .OrderBy(s => s.AcademicYear.StartDate)
                .ToListAsync(cancellationToken);

            // Provjera ako postoji obrisan semestar sa istom akademskom godinom
            /* Na ispitu pravilo:
             •	Ako postoji obrisan upis za istu akademsku godinu, korisnik treba koristiti Restore, a ne kreirati novi upis
             */
            if (semesters.Where(s => s.AcademicYearID == request.AcademicYearID && s.IsDeleted).Any())
                return BadRequest("Cannot enroll student on academic year that is deleted. " +
                    "Please, restore the semester recorded with that academic year");

            // Provjera ako se student upisuje u istu ili raniju akademsku godinu
            // (npr. zadnji upis mu je bio 2023/24 a pokušava se upisati u akademsku 2021/22)
            if (semesters.Any())
                if (academicYear.StartDate <= semesters.Max(s => s.AcademicYear.StartDate))
                    return BadRequest("Cannot enroll student on academic year that is older or same as his last academic year enrollment");

            // Provjera za cijenu i obnovu
            var counter = semesters.Where(s => s.StudyYear == request.StudyYear).Count();
            bool renewal = counter > 0;
            int fee = 1800;
            switch (counter)
            {
                case 0: break;
                case 1: fee = 400; break;
                case 2: fee = 500; break;
                default: fee = 600; break;
            }

            var newSemester = new Semester
            {
                TenantId = recordedBy.TenantId,
                StudentID = request.StudentID,
                AcademicYearID = request.AcademicYearID,
                StudyYear = request.StudyYear,
                EnrollmentDate = DateOnly.FromDateTime(request.EnrollmentDate),
                TuitionFee = fee,
                IsRenewal = renewal,
                RecordedByID = recordedBy.UserId,
            };

            await db.SemestersAll.AddAsync(newSemester, cancellationToken);
            await db.SaveChangesAsync(cancellationToken);

            return Ok(new { message = "Semester created successfully" });

        }
    }

    public class SemesterCreateRequest
    {
        public int AcademicYearID { get; set; }
        public int StudyYear { get; set; }
        public DateTime EnrollmentDate { get; set; }
        public int StudentID { get; set; }
    }
}