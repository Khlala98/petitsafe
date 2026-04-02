-- ═══════════════════════════════════════════════════════════
-- PetitSafe — Policies RLS Supabase (idempotent)
-- À exécuter après la première migration Prisma :
--   psql $DIRECT_URL -f supabase/rls-policies.sql
-- ═══════════════════════════════════════════════════════════

-- Activer RLS sur toutes les tables métier
ALTER TABLE "Structure" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserStructure" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Enfant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AllergieEnfant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContactUrgence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Biberon" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Repas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Change" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Sieste" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Equipement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReleveTemperature" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RelevePlat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReceptionMarchandise" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ZoneNettoyage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TacheNettoyage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ValidationNettoyage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Stock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MouvementStock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transmission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Protocole" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExportPDF" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DemandeDemo" ENABLE ROW LEVEL SECURITY;

-- ═══ FONCTIONS UTILITAIRES ═══

-- Vérifie si le user appartient à la structure
CREATE OR REPLACE FUNCTION user_belongs_to_structure(p_structure_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM "UserStructure"
    WHERE user_id = auth.uid()::text
      AND structure_id = p_structure_id::text
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Vérifie si le user a un rôle spécifique dans la structure
CREATE OR REPLACE FUNCTION user_has_role_in_structure(p_structure_id uuid, p_roles text[])
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM "UserStructure"
    WHERE user_id = auth.uid()::text
      AND structure_id = p_structure_id::text
      AND role::text = ANY(p_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ═══ DROP ALL EXISTING POLICIES (idempotent) ═══

DO $$ DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'Structure', 'UserStructure', 'Enfant', 'AllergieEnfant', 'ContactUrgence',
        'Biberon', 'Repas', 'Change', 'Sieste', 'Equipement',
        'ReleveTemperature', 'RelevePlat', 'ReceptionMarchandise',
        'ZoneNettoyage', 'TacheNettoyage', 'ValidationNettoyage',
        'Stock', 'MouvementStock', 'Transmission', 'Protocole',
        'ExportPDF', 'DemandeDemo'
      )
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ═══ STRUCTURE ═══

CREATE POLICY "structure_select" ON "Structure"
  FOR SELECT USING (
    user_belongs_to_structure(id::uuid)
  );

CREATE POLICY "structure_update" ON "Structure"
  FOR UPDATE USING (
    user_has_role_in_structure(id::uuid, ARRAY['GESTIONNAIRE'])
  );

-- ═══ USER_STRUCTURE ═══

CREATE POLICY "user_structure_select" ON "UserStructure"
  FOR SELECT USING (
    user_id = auth.uid()::text
    OR user_belongs_to_structure(structure_id::uuid)
  );

CREATE POLICY "user_structure_insert" ON "UserStructure"
  FOR INSERT WITH CHECK (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE'])
    OR user_id = auth.uid()::text -- auto-inscription à la création
  );

CREATE POLICY "user_structure_delete" ON "UserStructure"
  FOR DELETE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE'])
  );

-- ═══ ENFANT ═══

CREATE POLICY "enfant_select" ON "Enfant"
  FOR SELECT USING (user_belongs_to_structure(structure_id::uuid));

CREATE POLICY "enfant_insert" ON "Enfant"
  FOR INSERT WITH CHECK (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "enfant_update" ON "Enfant"
  FOR UPDATE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "enfant_delete" ON "Enfant"
  FOR DELETE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE'])
  );

-- ═══ ALLERGIE_ENFANT (jointure via enfant) ═══

CREATE POLICY "allergie_select" ON "AllergieEnfant"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Enfant" e
      WHERE e.id = "AllergieEnfant".enfant_id
        AND user_belongs_to_structure(e.structure_id::uuid)
    )
  );

CREATE POLICY "allergie_insert" ON "AllergieEnfant"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Enfant" e
      WHERE e.id = "AllergieEnfant".enfant_id
        AND user_has_role_in_structure(e.structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
    )
  );

CREATE POLICY "allergie_update" ON "AllergieEnfant"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "Enfant" e
      WHERE e.id = "AllergieEnfant".enfant_id
        AND user_has_role_in_structure(e.structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
    )
  );

CREATE POLICY "allergie_delete" ON "AllergieEnfant"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "Enfant" e
      WHERE e.id = "AllergieEnfant".enfant_id
        AND user_has_role_in_structure(e.structure_id::uuid, ARRAY['GESTIONNAIRE'])
    )
  );

-- ═══ CONTACT_URGENCE (jointure via enfant) ═══

CREATE POLICY "contact_select" ON "ContactUrgence"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Enfant" e
      WHERE e.id = "ContactUrgence".enfant_id
        AND user_belongs_to_structure(e.structure_id::uuid)
    )
  );

CREATE POLICY "contact_insert" ON "ContactUrgence"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Enfant" e
      WHERE e.id = "ContactUrgence".enfant_id
        AND user_has_role_in_structure(e.structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
    )
  );

CREATE POLICY "contact_update" ON "ContactUrgence"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "Enfant" e
      WHERE e.id = "ContactUrgence".enfant_id
        AND user_has_role_in_structure(e.structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
    )
  );

CREATE POLICY "contact_delete" ON "ContactUrgence"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "Enfant" e
      WHERE e.id = "ContactUrgence".enfant_id
        AND user_has_role_in_structure(e.structure_id::uuid, ARRAY['GESTIONNAIRE'])
    )
  );

-- ═══ BIBERON ═══

CREATE POLICY "biberon_select" ON "Biberon"
  FOR SELECT USING (user_belongs_to_structure(structure_id::uuid));

CREATE POLICY "biberon_insert" ON "Biberon"
  FOR INSERT WITH CHECK (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "biberon_update" ON "Biberon"
  FOR UPDATE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "biberon_delete" ON "Biberon"
  FOR DELETE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE'])
  );

-- ═══ REPAS ═══

CREATE POLICY "repas_select" ON "Repas"
  FOR SELECT USING (user_belongs_to_structure(structure_id::uuid));

CREATE POLICY "repas_insert" ON "Repas"
  FOR INSERT WITH CHECK (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "repas_update" ON "Repas"
  FOR UPDATE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "repas_delete" ON "Repas"
  FOR DELETE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE'])
  );

-- ═══ CHANGE ═══

CREATE POLICY "change_select" ON "Change"
  FOR SELECT USING (user_belongs_to_structure(structure_id::uuid));

CREATE POLICY "change_insert" ON "Change"
  FOR INSERT WITH CHECK (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "change_update" ON "Change"
  FOR UPDATE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "change_delete" ON "Change"
  FOR DELETE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE'])
  );

-- ═══ SIESTE ═══

CREATE POLICY "sieste_select" ON "Sieste"
  FOR SELECT USING (user_belongs_to_structure(structure_id::uuid));

CREATE POLICY "sieste_insert" ON "Sieste"
  FOR INSERT WITH CHECK (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "sieste_update" ON "Sieste"
  FOR UPDATE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "sieste_delete" ON "Sieste"
  FOR DELETE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE'])
  );

-- ═══ EQUIPEMENT ═══

CREATE POLICY "equipement_select" ON "Equipement"
  FOR SELECT USING (user_belongs_to_structure(structure_id::uuid));

CREATE POLICY "equipement_insert" ON "Equipement"
  FOR INSERT WITH CHECK (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "equipement_update" ON "Equipement"
  FOR UPDATE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "equipement_delete" ON "Equipement"
  FOR DELETE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE'])
  );

-- ═══ RELEVE_TEMPERATURE ═══

CREATE POLICY "releve_temp_select" ON "ReleveTemperature"
  FOR SELECT USING (user_belongs_to_structure(structure_id::uuid));

CREATE POLICY "releve_temp_insert" ON "ReleveTemperature"
  FOR INSERT WITH CHECK (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "releve_temp_update" ON "ReleveTemperature"
  FOR UPDATE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "releve_temp_delete" ON "ReleveTemperature"
  FOR DELETE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE'])
  );

-- ═══ RELEVE_PLAT ═══

CREATE POLICY "releve_plat_select" ON "RelevePlat"
  FOR SELECT USING (user_belongs_to_structure(structure_id::uuid));

CREATE POLICY "releve_plat_insert" ON "RelevePlat"
  FOR INSERT WITH CHECK (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "releve_plat_update" ON "RelevePlat"
  FOR UPDATE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "releve_plat_delete" ON "RelevePlat"
  FOR DELETE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE'])
  );

-- ═══ RECEPTION_MARCHANDISE ═══

CREATE POLICY "reception_select" ON "ReceptionMarchandise"
  FOR SELECT USING (user_belongs_to_structure(structure_id::uuid));

CREATE POLICY "reception_insert" ON "ReceptionMarchandise"
  FOR INSERT WITH CHECK (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "reception_update" ON "ReceptionMarchandise"
  FOR UPDATE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "reception_delete" ON "ReceptionMarchandise"
  FOR DELETE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE'])
  );

-- ═══ ZONE_NETTOYAGE ═══

CREATE POLICY "zone_nettoyage_select" ON "ZoneNettoyage"
  FOR SELECT USING (user_belongs_to_structure(structure_id::uuid));

CREATE POLICY "zone_nettoyage_insert" ON "ZoneNettoyage"
  FOR INSERT WITH CHECK (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "zone_nettoyage_update" ON "ZoneNettoyage"
  FOR UPDATE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE'])
  );

CREATE POLICY "zone_nettoyage_delete" ON "ZoneNettoyage"
  FOR DELETE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE'])
  );

-- ═══ TACHE_NETTOYAGE (jointure via zone) ═══

CREATE POLICY "tache_nettoyage_select" ON "TacheNettoyage"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "ZoneNettoyage" z
      WHERE z.id = "TacheNettoyage".zone_id
        AND user_belongs_to_structure(z.structure_id::uuid)
    )
  );

CREATE POLICY "tache_nettoyage_insert" ON "TacheNettoyage"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "ZoneNettoyage" z
      WHERE z.id = "TacheNettoyage".zone_id
        AND user_has_role_in_structure(z.structure_id::uuid, ARRAY['GESTIONNAIRE'])
    )
  );

CREATE POLICY "tache_nettoyage_update" ON "TacheNettoyage"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "ZoneNettoyage" z
      WHERE z.id = "TacheNettoyage".zone_id
        AND user_has_role_in_structure(z.structure_id::uuid, ARRAY['GESTIONNAIRE'])
    )
  );

CREATE POLICY "tache_nettoyage_delete" ON "TacheNettoyage"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "ZoneNettoyage" z
      WHERE z.id = "TacheNettoyage".zone_id
        AND user_has_role_in_structure(z.structure_id::uuid, ARRAY['GESTIONNAIRE'])
    )
  );

-- ═══ VALIDATION_NETTOYAGE (jointure via tache → zone) ═══

CREATE POLICY "validation_nettoyage_select" ON "ValidationNettoyage"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "TacheNettoyage" t
      JOIN "ZoneNettoyage" z ON z.id = t.zone_id
      WHERE t.id = "ValidationNettoyage".tache_id
        AND user_belongs_to_structure(z.structure_id::uuid)
    )
  );

CREATE POLICY "validation_nettoyage_insert" ON "ValidationNettoyage"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "TacheNettoyage" t
      JOIN "ZoneNettoyage" z ON z.id = t.zone_id
      WHERE t.id = "ValidationNettoyage".tache_id
        AND user_has_role_in_structure(z.structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
    )
  );

CREATE POLICY "validation_nettoyage_delete" ON "ValidationNettoyage"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "TacheNettoyage" t
      JOIN "ZoneNettoyage" z ON z.id = t.zone_id
      WHERE t.id = "ValidationNettoyage".tache_id
        AND user_has_role_in_structure(z.structure_id::uuid, ARRAY['GESTIONNAIRE'])
    )
  );

-- ═══ STOCK ═══

CREATE POLICY "stock_select" ON "Stock"
  FOR SELECT USING (user_belongs_to_structure(structure_id::uuid));

CREATE POLICY "stock_insert" ON "Stock"
  FOR INSERT WITH CHECK (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "stock_update" ON "Stock"
  FOR UPDATE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "stock_delete" ON "Stock"
  FOR DELETE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE'])
  );

-- ═══ MOUVEMENT_STOCK (jointure via stock) ═══

CREATE POLICY "mouvement_stock_select" ON "MouvementStock"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Stock" s
      WHERE s.id = "MouvementStock".stock_id
        AND user_belongs_to_structure(s.structure_id::uuid)
    )
  );

CREATE POLICY "mouvement_stock_insert" ON "MouvementStock"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Stock" s
      WHERE s.id = "MouvementStock".stock_id
        AND user_has_role_in_structure(s.structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
    )
  );

CREATE POLICY "mouvement_stock_delete" ON "MouvementStock"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "Stock" s
      WHERE s.id = "MouvementStock".stock_id
        AND user_has_role_in_structure(s.structure_id::uuid, ARRAY['GESTIONNAIRE'])
    )
  );

-- ═══ TRANSMISSION ═══

CREATE POLICY "transmission_select" ON "Transmission"
  FOR SELECT USING (user_belongs_to_structure(structure_id::uuid));

CREATE POLICY "transmission_insert" ON "Transmission"
  FOR INSERT WITH CHECK (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "transmission_update" ON "Transmission"
  FOR UPDATE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE', 'PROFESSIONNEL'])
  );

CREATE POLICY "transmission_delete" ON "Transmission"
  FOR DELETE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE'])
  );

-- ═══ PROTOCOLE ═══

CREATE POLICY "protocole_select" ON "Protocole"
  FOR SELECT USING (user_belongs_to_structure(structure_id::uuid));

CREATE POLICY "protocole_insert" ON "Protocole"
  FOR INSERT WITH CHECK (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE'])
  );

CREATE POLICY "protocole_update" ON "Protocole"
  FOR UPDATE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE'])
  );

CREATE POLICY "protocole_delete" ON "Protocole"
  FOR DELETE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE'])
  );

-- ═══ EXPORT_PDF ═══

CREATE POLICY "export_select" ON "ExportPDF"
  FOR SELECT USING (user_belongs_to_structure(structure_id::uuid));

CREATE POLICY "export_insert" ON "ExportPDF"
  FOR INSERT WITH CHECK (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE'])
  );

CREATE POLICY "export_delete" ON "ExportPDF"
  FOR DELETE USING (
    user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE'])
  );

-- ═══ DEMANDE_DEMO (publique en INSERT, visible uniquement par gestionnaire) ═══

CREATE POLICY "demo_insert" ON "DemandeDemo"
  FOR INSERT WITH CHECK (true); -- formulaire public

CREATE POLICY "demo_select" ON "DemandeDemo"
  FOR SELECT USING (
    structure_id IS NULL
    OR user_has_role_in_structure(structure_id::uuid, ARRAY['GESTIONNAIRE'])
  );

-- ═══ NOTE ═══
-- Les parents ne voient que les données de LEURS enfants
-- via les policies _select ci-dessus (user_belongs_to_structure inclut les parents)
-- Mais les parents n'ont AUCUN droit INSERT/UPDATE/DELETE (pas dans les arrays de rôles)
-- Les données enfant sont filtrées côté application pour ne montrer que les enfants liés au parent
