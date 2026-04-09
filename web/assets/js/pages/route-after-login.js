import { getSessionUser, getAppUser } from '../modules/auth.js';

(async () => {
  try {
    const authUser = await getSessionUser();
    if (!authUser) {
      window.location.href = '/web/index.html';
      return;
    }

    const appUser = await getAppUser(authUser.id);
    if (appUser.role === 'admin') {
      window.location.href = '/web/admin/dashboard.html';
      return;
    }

    if (appUser.role === 'agent') {
      window.location.href = '/web/agent/dashboard.html';
      return;
    }

    window.location.href = '/web/access-denied.html';
  } catch {
    window.location.href = '/web/access-denied.html';
  }
})();
