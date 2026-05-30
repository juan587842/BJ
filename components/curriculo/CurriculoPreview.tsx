'use client';

import ClassicoTemplate from './templates/ClassicoTemplate';
import ModernoTemplate from './templates/ModernoTemplate';
import type { Curriculo, TemplateId } from '@/types/curriculo';

export default function CurriculoPreview({ curriculo, template, corDestaque }: { curriculo: Curriculo; template: TemplateId; corDestaque: string }) {
  switch (template) {
    case 'moderno':
      return <ModernoTemplate curriculo={curriculo} corDestaque={corDestaque} />;
    case 'classico':
    default:
      return <ClassicoTemplate curriculo={curriculo} corDestaque={corDestaque} />;
  }
}
