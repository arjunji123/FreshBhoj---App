import React from 'react';
import { LEGAL_DOCS } from '@features/authentication/constants/legalContent';
import LegalDocScreen from '../components/LegalDocScreen';

const TermsOfService = () => <LegalDocScreen doc={LEGAL_DOCS.terms} />;

export default TermsOfService;
