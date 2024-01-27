import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet />
  `,
  styles: [],
})
export class AppComponent {
  private http = inject(HttpClient);

  ngOnInit() {
    this.http.get('http://localhost:3000/').subscribe((res) => {
      console.log(res);
    });

    const guess = { guess: 14 };

    this.http.post('http://localhost:3000/', guess).subscribe((res) => {
      console.log(res);
    });
  }
}
