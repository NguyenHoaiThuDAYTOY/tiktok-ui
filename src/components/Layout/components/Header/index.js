import classNames from 'classnames/bind';
import styles from './Header.module.scss';

const cx = classNames.bind(styles); //giúp viết className có dấu gạch ngang

function Header() {
    return (
        <header className={cx('wrapper')}>
            <div className={cx('inner')}></div>
        </header>
    );
}

export default Header;
