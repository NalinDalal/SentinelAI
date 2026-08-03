import { IsUrl, IsNotEmpty } from 'class-validator';

export class CreateScanDto {
  @IsUrl()
  @IsNotEmpty()
  url: string;
}