using Microsoft.AspNetCore.Mvc;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;

namespace RS1_2024_25.API.Endpoints.SemesterEndpoints
{
    [Route("student-semesters")]
    public class SemesterDeleteEndpoint(ApplicationDbContext db) : MyEndpointBaseAsync
        .WithRequest<int>
        .WithActionResult
    {
        [HttpDelete("{id}")]
        public override async Task<ActionResult> HandleAsync(int id, CancellationToken cancellationToken = default)
        {
            var semester = await db.SemestersAll.FindAsync(id, cancellationToken);

            if (semester == null)
                return NotFound("Semester not found");

            if (semester.IsDeleted)
                return BadRequest("Semester already deleted");

            semester.IsDeleted = true;
            await db.SaveChangesAsync(cancellationToken);

            return Ok(new { message = "Semester deleted successfully" });
        }
    }
}