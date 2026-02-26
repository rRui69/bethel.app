import {
    FaWater,
    FaHeart,
    FaUserCheck,
    FaComments,
    FaBreadSlice,
    FaHandHoldingMedical,
} from 'react-icons/fa6';

import { 
    GiLinkedRings,
    GiWaterDrop,
} from 'react-icons/gi';

/**
 * SACRAMENTS CONFIG — Setup sacrament links, icons, and colors here.
 * ─────────────────────────────────────────────────────────────────
 * TO CHANGE AN ICON:
 *   1. Go to https://react-icons.github.io/react-icons
 *   2. Search, find your icon, copy its name e.g. FaCross
 *   3. Add it to the import list above
 *   4. Replace the Icon: value below
 *
 * TO USE PNG/SVG instead of a react-icon:
 *   Replace `Icon: FaWater` with `imgSrc: '/images/icons/baptism.png'`
 *   then update the render logic in QuickLinks.jsx and
 *   SacramentsDropdown.jsx to check for imgSrc vs Icon.
 * ─────────────────────────────────────────────────────────────────
 */
const SACRAMENTS = [
    {
        id:    'baptism',
        label: 'Baptism',
        desc:  'Schedule a baptism',
        href:  '/sacraments/baptism',
        Icon:  GiWaterDrop,
        color: '#1a3c5e',
        bg:    '#dbeafe',
    },
    {
        id:    'marriage',
        label: 'Marriage',
        desc:  'Schedule a wedding',
        href:  '/sacraments/marriage',
        Icon:  GiLinkedRings,
        color: '#9b1c1c',
        bg:    '#fee2e2',
    },
    {
        id:    'confirmation',
        label: 'Confirmation',
        desc:  'Register for confirmation',
        href:  '/sacraments/confirmation',
        Icon:  FaUserCheck,
        color: '#065f46',
        bg:    '#d1fae5',
    },
    {
        id:    'confession',
        label: 'Confession',
        desc:  'Find confession schedule',
        href:  '/sacraments/confession',
        Icon:  FaComments,
        color: '#78350f',
        bg:    '#fef3c7',
    },
    {
        id:    'communion',
        label: 'First Communion',
        desc:  'First communion info',
        href:  '/sacraments/communion',
        Icon:  FaBreadSlice,
        color: '#1e40af',
        bg:    '#dbeafe',
    },
    {
        id:    'anointing',
        label: 'Anointing',
        desc:  'Request anointing of the sick',
        href:  '/sacraments/anointing',
        Icon:  FaHandHoldingMedical,
        color: '#4a1d96',
        bg:    '#ede9fe',
    },
];

export default SACRAMENTS;