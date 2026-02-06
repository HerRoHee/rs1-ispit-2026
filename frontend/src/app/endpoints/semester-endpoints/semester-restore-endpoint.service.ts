import {Injectable} from '@angular/core';
import {MyBaseEndpointAsync} from '../../helper/my-base-endpoint-async.interface';
import {MyConfig} from '../../my-config';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SemesterRestoreEndpointService implements MyBaseEndpointAsync<number, void> {
  private apiUrl = `${MyConfig.api_address}/student-semesters`;

  constructor(private httpClient: HttpClient) { }

  handleAsync(id: number): Observable<void> {
    return this.httpClient.post<void>(`${this.apiUrl}/${id}/restore`, null);
  }
}
