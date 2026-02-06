import {Injectable} from '@angular/core';
import {MyBaseEndpointAsync} from '../../helper/my-base-endpoint-async.interface';
import {MyConfig} from '../../my-config';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SemesterDeleteEndpointService implements MyBaseEndpointAsync<number, void> {
  private apiUrl = `${MyConfig.api_address}/student-semesters`;

  constructor(private httpClient: HttpClient) { }

  handleAsync(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }
}
