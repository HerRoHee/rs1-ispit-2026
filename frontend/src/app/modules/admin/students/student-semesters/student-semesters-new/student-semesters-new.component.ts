import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {
  AcademicYearLookupResponse, AcademicYearLookupEndpointService
} from '../../../../../endpoints/lookup-endpoints/academic-year-lookup-endpoint.service';
import {
  SemesterFilterRequest,
  SemesterGetAllByStudentIDEndpointService, SemesterResponse
} from '../../../../../endpoints/semester-endpoints/semester-get-all-by-studentID-endpoint.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {
  SemesterCreateRequest,
  SemesterInsertEndpointService
} from '../../../../../endpoints/semester-endpoints/semester-insert-endpoint.service';

@Component({
  selector: 'app-student-semesters-new',
  standalone: false,


  templateUrl: './student-semesters-new.component.html',
  styleUrl: './student-semesters-new.component.css'
})

export class StudentSemestersNewComponent implements OnInit {
  studentID: number;
  semesterForm: FormGroup;
  years: AcademicYearLookupResponse[] = [];
  semesters: SemesterResponse[] = [];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private academicYearLookupService: AcademicYearLookupEndpointService,
    private semesterGetAllService: SemesterGetAllByStudentIDEndpointService,
    private snackBar: MatSnackBar,
    private router: Router,
    private semesterInsertService: SemesterInsertEndpointService,
  ) {
    this.studentID = this.route.snapshot.params['id'];
    this.semesterForm = this.fb.group({
      enrollmentDate: ['', Validators.required],
      studyYear: [null, [Validators.required, Validators.min(1), Validators.max(6)]],
      academicYearID: [null, Validators.required],
      tuition: [{value: 1800, disabled: true}],
      renewal: [{value: false, disabled: true}],
    });
  }

  ngOnInit() {
    this.fetchData();

    this.semesterForm.get('studyYear')?.valueChanges.subscribe(
      (year:number) => {
        const _renewal = this.semesters.filter(
          s => s.studyYear == year
        ).length;

        this.semesterForm.get('renewal')?.setValue(!!_renewal);
        if (_renewal == 0)
          this.semesterForm.get('tuition')?.setValue(1800);
        else if (_renewal == 1)
          this.semesterForm.get('tuition')?.setValue(400);
        else if (_renewal == 2)
          this.semesterForm.get('tuition')?.setValue(500);
        else
          this.semesterForm.get('tuition')?.setValue(600);
      }
    )
  }

  insertSemester() {
    const request: SemesterCreateRequest = {
      academicYearID: this.semesterForm.get('academicYearID')?.value,
      studyYear: this.semesterForm.get('studyYear')?.value,
      enrollmentDate: this.semesterForm.get('enrollmentDate')?.value,
      studentID: Number(this.studentID)
    };

    console.log(request);

    this.semesterInsertService.handleAsync(request).subscribe({
      next: (data) => {
        this.snackBar.open("Semester saved successfully");
        this.router.navigate(['/admin/students', this.studentID, 'semesters']);
      },
      error: (error) => {
        this.snackBar.open('Error saving semester', error);
        console.error('Error saving semester', error);
      }
    });
  }

  private fetchData() {
    this.academicYearLookupService.handleAsync().subscribe({
      next: (data) => {
        this.years = data;
      }
    });
    this.semesterGetAllService.handleAsync(
      {
        q: '',
        pageNumber: 1,
        pageSize: 50,
        studentID: this.studentID,
        status: 'all'
      },
    ).subscribe({
      next: (data) => {
        this.semesters = data.dataItems;
      }
    })
  }
}
