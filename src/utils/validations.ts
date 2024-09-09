export class Validations {
  static ValidateUserRole = async (role: string): Promise<boolean> => {
    switch (role) {
      case 'ADMIN':
      case 'USER':
        return true;
      default:
        return false;
    }
  };

  static ValidateLoginOption = async (loginVia: string): Promise<boolean> => {
    switch (loginVia) {
      case 'Email':
      case 'Google':
      case 'Facebook':
      case 'Apple':
        return true;
      default:
        return false;
    }
  };
}
