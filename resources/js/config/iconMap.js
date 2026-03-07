/**
 * ICON MAP — shared between admin builder and public-facing components.
 * All icons come from react-icons/fa6 or react-icons/gi.
 * The string key is what gets stored in the DB.
 */
import {
    FaWater, FaHeart, FaUserCheck, FaComments, FaBreadSlice,
    FaHandHoldingMedical, FaChurch, FaHandsPraying, FaStar,
    FaDove, FaFire, FaBook, FaLeaf, FaUsers, FaDroplet,
    FaScroll, FaCross, FaAnkh, FaBabyCarriage, FaRing,
} from 'react-icons/fa6';
import { GiLinkedRings, GiWaterDrop, GiCandles } from 'react-icons/gi';

export const ICON_MAP = {
    water:       { Icon: FaWater,               label: 'Water'        },
    waterdrop:   { Icon: GiWaterDrop,           label: 'Water Drop'   },
    rings:       { Icon: GiLinkedRings,         label: 'Rings'        },
    ring:        { Icon: FaRing,                label: 'Ring'         },
    check:       { Icon: FaUserCheck,           label: 'Check/Confirm'},
    chat:        { Icon: FaComments,            label: 'Chat'         },
    bread:       { Icon: FaBreadSlice,          label: 'Bread'        },
    healing:     { Icon: FaHandHoldingMedical,  label: 'Healing'      },
    church:      { Icon: FaChurch,              label: 'Church'       },
    hands:       { Icon: FaHandsPraying,        label: 'Prayer'       },
    star:        { Icon: FaStar,                label: 'Star'         },
    dove:        { Icon: FaDove,                label: 'Dove'         },
    fire:        { Icon: FaFire,                label: 'Fire/Spirit'  },
    book:        { Icon: FaBook,                label: 'Scripture'    },
    leaf:        { Icon: FaLeaf,                label: 'Olive/Peace'  },
    heart:       { Icon: FaHeart,               label: 'Heart'        },
    users:       { Icon: FaUsers,               label: 'Community'    },
    scroll:      { Icon: FaScroll,              label: 'Scroll'       },
    baby:        { Icon: FaBabyCarriage,        label: 'Baby'         },
    candles:     { Icon: GiCandles,             label: 'Candles'      },
    droplet:     { Icon: FaDroplet,             label: 'Droplet'      },
    cross:       { Icon: FaCross,               label: 'Cross'        },
};

export const ICON_OPTIONS = Object.entries(ICON_MAP).map(([key, val]) => ({
    key,
    ...val,
}));

// Preset color palettes for icon + background
export const COLOR_PRESETS = [
    { label: 'Navy',    color: '#1a3c5e', bg: '#dbeafe' },
    { label: 'Red',     color: '#9b1c1c', bg: '#fee2e2' },
    { label: 'Green',   color: '#065f46', bg: '#d1fae5' },
    { label: 'Amber',   color: '#78350f', bg: '#fef3c7' },
    { label: 'Indigo',  color: '#1e40af', bg: '#e0e7ff' },
    { label: 'Purple',  color: '#4a1d96', bg: '#ede9fe' },
    { label: 'Pink',    color: '#9d174d', bg: '#fce7f3' },
    { label: 'Teal',    color: '#134e4a', bg: '#ccfbf1' },
    { label: 'Gold',    color: '#78350f', bg: '#fef9c3' },
    { label: 'Slate',   color: '#1e293b', bg: '#f1f5f9' },
];

export default ICON_MAP;