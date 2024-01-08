import { HeaderOnly } from '~/components/Layout';

import Home from '~/pages/Home';
import CreateSchedule from '~/pages/CreateSchedule';
import Schedule from '~/pages/Schedule';
import Profile from '~/pages/Profile';
import SignIn from '~/pages/SignIn';
import SignUp from '~/pages/SignUp';
import ManagerSchedule from '~/pages/ManagerSchedule';
import ManagerCustomer from '~/pages/ManagerCustomer';
import ManagerStaff from '~/pages/ManagerStaff';
import ManagerCalendar from '~/pages/ManagerCalendar';
import ManagerService from '~/pages/ManagerService';
import ManagerBill from '~/pages/ManagerBill';
import ManagerReportSchedule from '~/pages/ManagerReportSchedule';
import ManagerReportCustomer from '~/pages/ManagerReportCustomer';
import { DefaultLayout } from '~/components/Layout';
import { HeaderLayout } from '~/components/Layout';
import { AdminLayout } from '~/components/Layout';

const publicRoutes = [
    { path: '/sign-in', component: SignIn },
    { path: '/sign-up', component: SignUp },
];

const privateRoutes = [
    { path: '/', component: Home, Layout: DefaultLayout},
    { path: '/create-schedule', component: CreateSchedule, Layout: HeaderLayout },
    { path: '/schedule', component: Schedule, Layout: DefaultLayout},
    { path: '/manager-schedule', component: ManagerSchedule, Layout: AdminLayout },
    { path: '/manager-customer', component: ManagerCustomer, Layout: AdminLayout },
    { path: '/manager-staff', component: ManagerStaff, Layout: AdminLayout },
    { path: '/manager-calendar', component: ManagerCalendar, Layout: AdminLayout },
    { path: '/manager-service', component: ManagerService, Layout: AdminLayout },
    { path: '/manager-bill', component: ManagerBill, Layout: AdminLayout },
    { path: '/manager-report-schedule', component: ManagerReportSchedule, Layout: AdminLayout },
    { path: '/manager-report-customer', component: ManagerReportCustomer, Layout: AdminLayout },
    // { path: '/profile', component: Profile },
    // { path: '/upload', component: Upload, layout: HeaderOnly },
    // { path: '/search', component: Search, layout: null },
];

export { privateRoutes, publicRoutes };
