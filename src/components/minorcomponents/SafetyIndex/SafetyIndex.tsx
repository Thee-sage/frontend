import styles from './SafetyIndex.module.css';
import { TrustIndex } from '../types';
interface SafetyIndexProps {
  trustIndex: TrustIndex | undefined;
}

export const SafetyIndex = ({ trustIndex }: SafetyIndexProps) => {
  const getStatusClass = (status: string | undefined) => {
    switch(status?.toLowerCase()) {
      case 'high':
        return styles.high;
      case 'medium':
        return styles.medium;
      case 'low':
        return styles.low;
      default:
        return styles.default;
    }
  };

  return (
    <div className={`${styles.safetyIndex} ${getStatusClass(trustIndex)}`}>
      SAFETY INDEX: {trustIndex?.toUpperCase()}
    </div>
  );
};