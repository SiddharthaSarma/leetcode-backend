import { Injectable, HttpService } from '@nestjs/common';
import { map } from 'rxjs/operators';
@Injectable()
export class AppService {
  constructor(private http: HttpService) {}
  getHello() {
    return this.http
      .get('https://leetcode.com/api/problems/all/')
      .pipe(map(response => response.data));
  }
}
