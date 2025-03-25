import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const AuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token'); // ✅ Check if user is authenticated

  if (token) {
    return true; // ✅ Allow access if logged in
  } else {
    router.navigate(['/login']); // ❌ Redirect to login if not authenticated
    return false;
  }
};
