import Header from './Header';
import TabMenu from './TabMenu';
import styles from './AdminLayout.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function AdminLayout({ children }) {
    return (
        <div className={cx('wrapper')}>
            <Header />
            <TabMenu />
            <div className={cx('container')}>
                <div className={cx('tab-menu')}></div>
                <div className={cx('content')}>{children}</div>
            </div>
        </div>
    );
}

export default AdminLayout;
