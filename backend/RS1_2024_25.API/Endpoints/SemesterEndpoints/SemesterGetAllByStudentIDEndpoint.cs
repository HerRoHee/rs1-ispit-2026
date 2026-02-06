using Microsoft.AspNetCore.Mvc;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper;
using RS1_2024_25.API.Helper.Api;

namespace RS1_2024_25.API.Endpoints.SemesterEndpoints
{
    [Route("students")]
    public class SemesterGetAllByStudentIDEndpoint(ApplicationDbContext db) : MyEndpointBaseAsync
        .WithRequest<SemesterFilterRequest>
        .WithActionResult<MyPagedList<SemesterResponse>>
    {
        [HttpGet("{studentID}/semesters/filter")]
        public override async Task<ActionResult<MyPagedList<SemesterResponse>>> HandleAsync(
            [FromQuery] SemesterFilterRequest request,
            CancellationToken cancellationToken = default
            )
        {
            // Provjera da li postoji student
            var student = await db.StudentsAll.FindAsync(request.StudentID, cancellationToken);
            if (student == null)
                return BadRequest("Student not found");

            // Provjera da li je validan status
            if (
                request.Status?.ToLower() != "all" &&
                request.Status?.ToLower() != "active" &&
                request.Status?.ToLower() != "deleted"
                )
                return BadRequest("Invalid status. Allowed values: 'all', 'active', 'deleted'");

            var query = db.SemestersAll.AsQueryable().Where(s => s.StudentID == request.StudentID);

            if (request.Status?.ToLower() == "active")
                query = query.Where(s => !s.IsDeleted);
            else if (request.Status?.ToLower() == "deleted")
                query = query.Where(s => s.IsDeleted);

            if (!string.IsNullOrEmpty(request.Q))
            {
                query = query.Where(s =>
                    s.AcademicYear.Description.Contains(request.Q) ||
                    s.EnrollmentDate.ToString().Contains(request.Q) ||
                    s.IsRenewal.ToString().Contains(request.Q) ||
                    s.RecordedBy.FirstName.Contains(request.Q) ||
                    s.RecordedBy.LastName.Contains(request.Q)
                );
            }

            var projectedQuery = query.Select(s => new SemesterResponse
            {
                ID = s.ID,
                AcademicYearDesc = s.AcademicYear.Description,
                StudyYear = s.StudyYear,
                EnrollmentDate = s.EnrollmentDate,
                IsRenewal = s.IsRenewal,
                IsDeleted = s.IsDeleted,
            });

            var result = await MyPagedList<SemesterResponse>
                .CreateAsync(projectedQuery, request, cancellationToken);

            return Ok(result);
        }
    }

    public class SemesterFilterRequest : MyPagedRequest
    {
        public string? Q { get; set; } = string.Empty;
        public int StudentID { get; set; }
        public string Status { get; set; } = "active";
    }

    public class SemesterResponse
    {
        public int ID { get; set; }
        public string AcademicYearDesc { get; set; } = string.Empty;
        public int StudyYear { get; set; }
        public DateOnly EnrollmentDate { get; set; }
        public bool IsRenewal { get; set; }
        public float TuitionFee { get; set; }
        public bool IsDeleted { get; set; }
    }
}