import {Injectable} from '@angular/core';
import {MyBaseEndpointAsync} from '../../helper/my-base-endpoint-async.interface';
import {MyConfig} from '../../my-config';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SemesterCreateRequest {
  academicYearID: number,
  studyYear: number,
  enrollmentDate: string,
  studentID: number,
}

@Injectable({
  providedIn: 'root'
})
export class SemesterInsertEndpointService
  implements MyBaseEndpointAsync<SemesterCreateRequest, void> {
  private apiUrl = `${MyConfig.api_address}/students`;

  constructor(private httpClient: HttpClient) { }

  handleAsync(request: SemesterCreateRequest): Observable<void> {
    return this.httpClient.post<void>(`${this.apiUrl}/${request.studentID}/semesters`, request);
  }
}
