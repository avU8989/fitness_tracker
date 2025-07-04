import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginUserRequest {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  password!: string;
}
