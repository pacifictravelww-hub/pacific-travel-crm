import { Suspense } from 'react';
import EditLeadClient from './EditLeadClient';

export default function EditLeadPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-slate-400">טוען...</div>}>
      <EditLeadClient />
    </Suspense>
  );
}
