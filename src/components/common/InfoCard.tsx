// Standardized Info Card component - for content without images
// Follows the same title/subtitle pattern as VehicleCard for consistency
import React from 'react';
import {
  View,
  TouchableOpacity,
} from 'react-native';
import { Card } from './Card';
import { Typography } from './Typography';

interface InfoCardProps {
  title: string;
  subtitle?: string | React.ReactNode;
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'filled' | 'floating';
  style?: any;
  titleStyle?: any;
  subtitleStyle?: any;
}

/**
 * Standardized Info Card Component
 * 
 * Provides consistent formatting using Card's title/subtitle pattern
 * instead of manual Typography placement.
 * 
 * Usage:
 * <InfoCard 
 *   title="Vehicle Status" 
 *   subtitle="All maintenance up to date"
 * >
 *   <AdditionalContent />
 * </InfoCard>
 */
const InfoCard: React.FC<InfoCardProps> = ({
  title,
  subtitle,
  children,
  onPress,
  variant = 'elevated',
  style,
  titleStyle,
  subtitleStyle
}) => {
  return (
    <Card
      variant={variant}
      title={title}
      subtitle={subtitle}
      pressable={!!onPress}
      onPress={onPress}
      style={style}
      titleStyle={titleStyle}
      subtitleStyle={subtitleStyle}
    >
      {children}
    </Card>
  );
};

export default InfoCard;