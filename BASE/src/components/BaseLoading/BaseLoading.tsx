import { forwardRef } from 'react';
import styles from './BaseLoading.module.css';

export type BaseLoadingProps = {
  marginLeft?: string;
  bottom?: string;
  marginTopContainer?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const BaseLoading = forwardRef<HTMLDivElement, BaseLoadingProps>(
  (
    {
      marginLeft = '0px',
      bottom = '10px',
      marginTopContainer = '20px',
      size = 'md',
      className = '',
    },
    ref
  ) => {
    const sizeClass = {
      sm: styles.sizeSm,
      md: styles.sizeMd,
      lg: styles.sizeLg,
    }[size];

    return (
      <div
        ref={ref}
        className={`${styles.loadingIcon} ${className}`}
        style={{
          marginLeft,
          bottom,
          marginTop: marginTopContainer,
        }}
      >
        <div className={`${styles.container} ${sizeClass}`}>
          <div className={`${styles.dot} ${styles.dot1}`}></div>
          <div className={`${styles.dot} ${styles.dot2}`}></div>
          <div className={`${styles.dot} ${styles.dot3}`}></div>
        </div>
      </div>
    );
  }
);

export default BaseLoading;
