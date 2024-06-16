const authRepository = require('../repositories/auth.repository.js');

class AuthService {
    constructor(authRepository) {
        this.authRepository = authRepository;
    }

    login() {
        this.authenticated = true;
    }

    logout() {
        this.authenticated = false;
    }

    isAuthenticated() {
        return this.authenticated;
    }
}