import React from 'react';
import { Svg, Path, Circle, G, Rect, Line } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Maintenance & Repairs Icon (replacing 🔧)
export const MaintenanceIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Modifications & Upgrades Icon (replacing ⚡)
export const ModificationsIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Fuel & Costs Icon (replacing ⛽)
export const FuelIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M5 4h10v16H5V4z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path 
      d="M15 12h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path 
      d="M20 8v4"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="7" cy="8" r="1" fill={color} />
  </Svg>
);

// Reminders & Schedules Icon (replacing ⏰)
export const RemindersIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke={color} 
      strokeWidth={strokeWidth}
    />
    <Path 
      d="M12 6v6l4 2"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Vehicle Icon (replacing 🚗)
export const VehicleIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M7 17h10l4-10H5l2 10z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path 
      d="M6 6l15 1"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="9" cy="17" r="2" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="20" cy="17" r="2" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

// Mobile/Data Icon (replacing 📱)
export const MobileIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect 
      x="5" y="2" width="14" height="20" rx="2" ry="2"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Path 
      d="M12 18h.01"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Settings/Gear Icon (replacing ⚙️)
export const SettingsIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
    <Path 
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Notifications Icon (replacing 🔔)
export const NotificationsIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path 
      d="M13.73 21a2 2 0 0 1-3.46 0"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Cloud/Backup Icon (replacing ☁️)
export const CloudIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Export/Download Icon (replacing 📤)
export const ExportIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path 
      d="M7 10l5-5 5 5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path 
      d="M12 15V5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Help/Question Icon (replacing ❓)
export const HelpIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke={color} 
      strokeWidth={strokeWidth}
    />
    <Path 
      d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path 
      d="M12 17h.01"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Feedback/Message Icon (replacing 💬)
export const FeedbackIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Info Icon (replacing ℹ️)
export const InfoIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke={color} 
      strokeWidth={strokeWidth}
    />
    <Path 
      d="M12 16v-4"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path 
      d="M12 8h.01"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Globe/Language Icon (replacing 🌐)
export const GlobeIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke={color} 
      strokeWidth={strokeWidth}
    />
    <Path 
      d="M2 12h20"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path 
      d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Units/Ruler Icon (replacing 📏)
export const RulerIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0l12.6 12.6z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path 
      d="M16 5l3 3"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path 
      d="M14 7l3 3"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path 
      d="M10 11l3 3"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Activity/Log Icon (replacing 📋)
export const ActivityIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect 
      x="8" y="2" width="8" height="4" rx="1" ry="1"
      stroke={color}
      strokeWidth={strokeWidth}
    />
  </Svg>
);

// Camera/Photo Icon (replacing 📷)
export const CameraIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

// Mail/Mailbox Icon (replacing 📬)
export const MailIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path 
      d="M22 6l-10 7L2 6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ChevronRight Icon for CTAs and navigation
export const ChevronRightIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M9 18l6-6-6-6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Clipboard/Programs Icon - For maintenance programs and schedules
export const ClipboardIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect 
      x="8" y="2" width="8" height="4" rx="1" ry="1"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Path 
      d="M9 12h6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path 
      d="M9 16h6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path 
      d="M9 8h6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

// Trash/Delete Icon
export const TrashIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M3 6h18"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path 
      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path 
      d="M10 11v6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path 
      d="M14 11v6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Car Silhouette Icon - Default placeholder for vehicle photos
export const CarSilhouetteIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M5 12h2l1-3h8l1 3h2v8a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="8.5" cy="16.5" r="1.5" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="15.5" cy="16.5" r="1.5" stroke={color} strokeWidth={strokeWidth} />
    <Path 
      d="M5 12V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Alert Triangle Icon for warnings and conflicts
export const AlertTriangleIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line 
      x1="12" 
      y1="9" 
      x2="12" 
      y2="13"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path 
      d="M12 17h.01"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Edit Icon (pencil)
export const EditIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#1e40af',
  strokeWidth = 1.5 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M12 20h9"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path 
      d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Calendar Icon
export const CalendarIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#1e40af',
  strokeWidth = 1.5 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect 
      x="3" 
      y="4" 
      width="18" 
      height="18" 
      rx="2" 
      ry="2"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Line 
      x1="16" 
      y1="2" 
      x2="16" 
      y2="6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Line 
      x1="8" 
      y1="2" 
      x2="8" 
      y2="6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Line 
      x1="3" 
      y1="10" 
      x2="21" 
      y2="10"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

// Lock Icon for premium features
export const LockIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect 
      x="3" 
      y="11" 
      width="18" 
      height="11" 
      rx="2" 
      ry="2"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Circle 
      cx="12" 
      cy="16" 
      r="1"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Path 
      d="M7 11V7a5 5 0 0 1 10 0v4"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Dollar Icon for costs and pricing
export const DollarIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line 
      x1="12" 
      y1="1" 
      x2="12" 
      y2="23"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path 
      d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Pie Chart Icon for cost breakdowns
export const PieChartIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M21.21 15.89A10 10 0 1 1 8 2.83"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path 
      d="M22 12A10 10 0 0 0 12 2v10z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Trending Up Icon for positive trends
export const TrendingUpIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M3 17l6-6 4 4 8-8"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path 
      d="M17 7h4v4"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Trending Down Icon for negative trends
export const TrendingDownIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M3 7l6 6 4-4 8 8"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path 
      d="M17 17h4v-4"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Bar Chart Icon for statistics
export const BarChartIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line 
      x1="12" 
      y1="20" 
      x2="12" 
      y2="10"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Line 
      x1="18" 
      y1="20" 
      x2="18" 
      y2="4"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Line 
      x1="6" 
      y1="20" 
      x2="6" 
      y2="16"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

// Search Icon for filtering and search functionality
export const SearchIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle 
      cx="11" 
      cy="11" 
      r="8"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Path 
      d="M21 21l-4.35-4.35"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// X Circle Icon for clear/close functionality
export const XCircleIcon: React.FC<IconProps & { onPress?: () => void }> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2,
  onPress
}) => (
  <Svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    onPress={onPress}
  >
    <Circle 
      cx="12" 
      cy="12" 
      r="10"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Line 
      x1="15" 
      y1="9" 
      x2="9" 
      y2="15"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Line 
      x1="9" 
      y1="9" 
      x2="15" 
      y2="15"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

// Chevron Down Icon for dropdowns and expansion
export const ChevronDownIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M6 9l6 6 6-6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Check Icon for checkboxes and selected states
export const CheckIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#666', 
  strokeWidth = 2 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M20 6L9 17l-5-5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);


export default {
  MaintenanceIcon,
  ModificationsIcon,
  FuelIcon,
  RemindersIcon,
  VehicleIcon,
  MobileIcon,
  SettingsIcon,
  NotificationsIcon,
  CloudIcon,
  ExportIcon,
  HelpIcon,
  FeedbackIcon,
  InfoIcon,
  GlobeIcon,
  RulerIcon,
  ActivityIcon,
  CameraIcon,
  MailIcon,
  ClipboardIcon,
  CarSilhouetteIcon,
  AlertTriangleIcon,
  EditIcon,
  CalendarIcon,
  LockIcon,
  DollarIcon,
  PieChartIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  BarChartIcon,
  SearchIcon,
  XCircleIcon,
  ChevronDownIcon,
  CheckIcon,
};