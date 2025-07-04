import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from "class-validator";

export class CreateUserRequest {
  @IsNotEmpty({ message: "Username is required" })
  username!: string;

  @IsEmail({}, { message: "Please enter a valid emai" })
  email!: string;

  @IsNotEmpty({ message: "Password required" })
  password!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  age?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;
}
