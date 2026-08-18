import { AuthRepository } from '../repositories/auth.repositories';

export class ToggleUserActiveService {
  constructor(private readonly authRepository: AuthRepository) {}

  public async execute(userId: string): Promise<boolean> {
    const isActive = await this.authRepository.toggleUserActive(userId);
    return isActive;
  }
}
