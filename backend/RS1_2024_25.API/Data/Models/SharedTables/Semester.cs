using RS1_2024_25.API.Data.Models.TenantSpecificTables.Modul1_Auth;
using RS1_2024_25.API.Data.Models.TenantSpecificTables.Modul2_Basic;
using RS1_2024_25.API.Helper.BaseClasses;
using System.ComponentModel.DataAnnotations.Schema;

namespace RS1_2024_25.API.Data.Models.SharedTables
{
    public class Semester : TenantSpecificTable
    // Naslijeđivanjem TenantSpecificTable imamo podatak o ID-u, TenantdID-u i vremenu kad je kreiran i modifikovan zapis
    {
        public int StudentID { get; set; }
        [ForeignKey(nameof(StudentID))]
        public Student Student { get; set; } = null!;
        public int AcademicYearID { get; set; }
        [ForeignKey(nameof(AcademicYearID))]
        public AcademicYear AcademicYear { get; set; } = null!;
        public int StudyYear { get; set; }
        public DateOnly EnrollmentDate { get; set; }
        public float TuitionFee { get; set; }
        public bool IsRenewal { get; set; }
        public int RecordedByID { get; set; } // FK na korisnika koji je evidentirao
        [ForeignKey(nameof(RecordedByID))]
        public MyAppUser RecordedBy { get; set; } = null!;
        public bool IsDeleted { get; set; } = false;
    }
}