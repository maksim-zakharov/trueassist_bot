// user-response._dto.ts
import { Exclude, Expose, Transform } from 'class-transformer';

export class UserResponseDTO {
  @Exclude() // Исключаем это поле из ответа
  createdAt: string;

  firstName: string;
  lastName: string;
  // @Exclude() // Исключаем это поле из ответа
  id: string;
  phone: string;
  photoUrl: string;
  role: string;
  username: string;

  // Показывать isAdmin только если true
  @Transform(({ value, obj }) => (value === true ? true : undefined), {
    toPlainOnly: true, // Применяем только при преобразовании в JSON
  })
  isAdmin?: boolean;
}
