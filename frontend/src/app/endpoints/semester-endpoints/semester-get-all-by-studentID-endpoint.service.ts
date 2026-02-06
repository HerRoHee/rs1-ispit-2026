import {MyPagedRequest} from '../../helper/my-paged-request';
import {Injectable} from '@angular/core';
import {MyBaseEndpointAsync} from '../../helper/my-base-endpoint-async.interface';
import {MyPagedList} from '../../helper/my-paged-list';
import {HttpClient} from '@angular/common/http';
import {MyConfig} from '../../my-config';
import { Observable } from 'rxjs';
import {buildHttpParams} from '../../helper/http-params.helper';

export interface SemesterFilterRequest extends MyPagedRequest {
  q?: string;
  studentID: number;
  status: string;
}

export interface SemesterResponse {
  id: number;
  academicYearDesc: string;
  studyYear: number;
  enrollmentDate: string;
  isRenewal: boolean;
  tuitionFee: number;
  isDeleted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SemesterGetAllByStudentIDEndpointService
  implements MyBaseEndpointAsync<SemesterFilterRequest, MyPagedList<SemesterResponse>> {
  private apiUrl = `${MyConfig.api_address}/students`;

  constructor(private httpClient: HttpClient) { }

  handleAsync(request: SemesterFilterRequest): Observable<MyPagedList<SemesterResponse>> {
    const params = buildHttpParams(request);
    return this.httpClient
      .get<MyPagedList<SemesterResponse>>(
        `${this.apiUrl}/${request.studentID}/semesters/filter`,
        {params}
      );
  }
}
