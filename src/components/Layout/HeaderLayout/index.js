import Header from './Header';
import Footer from './Footer';
import styles from './HeaderLayout.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function HeaderLayout({ children }) {
    return (
        <div className={cx('wrapper')}>
            <Header />
            <div className={cx('container')}>
                <div className={cx('content')}>{children}</div>
            </div>
        </div>
    );
}

export default HeaderLayout;
