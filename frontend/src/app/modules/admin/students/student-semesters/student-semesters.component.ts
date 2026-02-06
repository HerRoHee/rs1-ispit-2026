import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {
  SemesterGetAllByStudentIDEndpointService,
  SemesterResponse
} from '../../../../endpoints/semester-endpoints/semester-get-all-by-studentID-endpoint.service';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {SemesterDeleteEndpointService} from '../../../../endpoints/semester-endpoints/semester-delete-endpoint.service';
import {
  SemesterRestoreEndpointService
} from '../../../../endpoints/semester-endpoints/semester-restore-endpoint.service';
import {debounceTime, distinctUntilChanged, filter, Subject} from 'rxjs';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {map} from 'rxjs/operators';
import {MyDialogConfirmComponent} from '../../../shared/dialogs/my-dialog-confirm/my-dialog-confirm.component';

@Component({
  selector: 'app-student-semesters',
  standalone: false,


  templateUrl: './student-semesters.component.html',
  styleUrl: './student-semesters.component.css'
})
export class StudentSemestersComponent implements OnInit, AfterViewInit {
  dataSource: MatTableDataSource<SemesterResponse> = new MatTableDataSource<SemesterResponse>();
  displayedColumns: string[] = ['academicYearDesc', 'studyYear', 'enrollmentDate', 'isRenewal', 'tuitionFee', 'actions'];
  semesters: SemesterResponse[] = [];
  studentID: number;
  selectedStatus: string = 'Active';
  status: string[] = ['All', 'Active', 'Deleted'];
  deletedStyle = {
    'textDecoration': 'line-through',
    'color': 'gray'
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private searchSubject: Subject<string> = new Subject();
  private currentQ: string = '';

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private semesterGetService: SemesterGetAllByStudentIDEndpointService,
    private semesterDeleteService: SemesterDeleteEndpointService,
    private semesterRestoreService: SemesterRestoreEndpointService
  ) {
    this.studentID = this.route.snapshot.params['id'];
  }

  ngOnInit() {
    this.initSearchListener();
    this.fetchData();
  }

  // C Zadatak
  initSearchListener() { // Subscription koji je napravljen u ngOnInit
    this.searchSubject.pipe( // Search subject koji je private unutar ovog .ts-a
      debounceTime(300), // Debounce time 300ms
      distinctUntilChanged(), // Poziva API kada korisnik prestane kucati
      map(x => x.toLowerCase()), // Pretvara u mala slova
      map(x => x.length > 3 ? x : ''), // Šalje q samo ako je veći od 3 karaktera
    ).subscribe((filterValue) => {
      this.currentQ = filterValue;
      this.fetchData(filterValue, this.paginator.pageIndex + 1, this.paginator.pageSize);
    });
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => {
      const filterValue = this.dataSource.filter || '';
      this.fetchData(filterValue, this.paginator.pageIndex + 1, this.paginator.pageSize);
    })
  }

  applyFilter($event: KeyboardEvent) { // Isto C zadatak, applyFilter ne poziva fetchData
    const filterValue = ($event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue);
  }

  fetchData(filter: string = '', page: number = 1, pageSize: number = 5) {
    console.log("q: ", filter); // C.3 zadatak ispisivanje q-a prije requesta
    this.semesterGetService.handleAsync(
      {
        q: filter,
        pageNumber: page,
        pageSize: pageSize,
        studentID: this.studentID,
        status: this.selectedStatus
      },
    ).subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource<SemesterResponse>(data.dataItems);
        this.paginator.length = data.totalCount;
        this.semesters = data.dataItems;
        console.log("Total count: ", data.totalCount); // C.3 zadatak, ispisivanje totalCount
      }
    });
  }

  deleteSemester(id:number) {
    const dialogRef = this.dialog.open(MyDialogConfirmComponent, {
      width: '350px',
      data: {
        title: 'Accept delete',
        message: 'Are you sure you want to delete this semester?',
        confirmButtonText: 'Yes',
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.semesterDeleteService.handleAsync(id).subscribe({
          next: () => {
            this.fetchData(this.currentQ, this.paginator.pageIndex + 1, this.paginator.pageSize);
          }
        });
      }
    });
  }

  restoreSemester(id:number) {
    const dialogRef = this.dialog.open(MyDialogConfirmComponent, {
      width: '350px',
      data: {
        title: 'Accept restore',
        message: 'Are you sure you want to restore this semester?',
        confirmButtonText: 'Yes',
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.semesterRestoreService.handleAsync(id).subscribe({
          next: () => {
            this.fetchData(this.currentQ, this.paginator.pageIndex + 1, this.paginator.pageSize);
          }
        });
      }
    });
  }

  onStatusChange(status: string) {
    this.selectedStatus = status.toLowerCase();
    this.paginator.pageIndex = 0;
    this.fetchData(this.currentQ, this.paginator.pageIndex + 1, this.paginator.pageSize);
  }

  noviSemestar() {
    this.router.navigate(['/admin/students', this.studentID, 'semesters', 'new']);
  }
}
