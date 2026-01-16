import { Component } from '@angular/core';
import { LoginButtonComponent } from '../login-button.component';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-auth0',
  standalone: true,
  imports: [LoginButtonComponent],
  templateUrl: './auth0.component.html',
  styleUrls: ['./auth0.component.scss'],
})
export class Auth0Component {
  constructor(public auth: AuthApiService) {}
}
