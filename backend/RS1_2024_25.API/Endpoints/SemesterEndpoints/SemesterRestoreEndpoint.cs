using Microsoft.AspNetCore.Mvc;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;

namespace RS1_2024_25.API.Endpoints.SemesterEndpoints
{
    [Route("student-semesters")]
    public class SemesterRestoreEndpoint(ApplicationDbContext db) : MyEndpointBaseAsync
        .WithRequest<int>
        .WithActionResult
    {
        [HttpPost("{id}/restore")]
        public override async Task<ActionResult> HandleAsync(int id, CancellationToken cancellationToken = default)
        {
            var semester = await db.SemestersAll.FindAsync(id, cancellationToken);

            if (semester == null)
                return NotFound("Semester not found");

            if (!semester.IsDeleted)
                return BadRequest("Semester is not deleted");

            semester.IsDeleted = false;
            await db.SaveChangesAsync(cancellationToken);

            return Ok("Semester restored successfully");
        }
    }
}