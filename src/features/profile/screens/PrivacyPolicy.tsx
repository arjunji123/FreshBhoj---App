import React from 'react';
import { LEGAL_DOCS } from '@features/authentication/constants/legalContent';
import LegalDocScreen from '../components/LegalDocScreen';

const PrivacyPolicy = () => <LegalDocScreen doc={LEGAL_DOCS.privacy} />;

export default PrivacyPolicy;
