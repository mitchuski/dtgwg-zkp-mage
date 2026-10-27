import Formal

/-! Axiom footprint of every theorem a record's `formal` part cites.
`scripts/check-axioms.sh` fails on `sorryAx` or any axiom outside
propext · Classical.choice · Quot.sound. -/

#print axioms Formal.Gadgets.replay_refused
#print axioms Formal.Gadgets.run_once
#print axioms Formal.Gadgets.path_sound
#print axioms Formal.Gadgets.path_complete
#print axioms Formal.Gadgets.path_sound_fixed_depth
#print axioms Formal.Gadgets.no_domain_second_preimage
#print axioms Formal.Gadgets.one_leaf_one_nullifier
#print axioms Formal.Gadgets.reuse_refused
#print axioms Formal.Gadgets.unbound_nullifier_unsound
#print axioms Formal.Gadgets.cross_context_not_detected
#print axioms Formal.Gadgets.one_person_two_nullifiers
#print axioms Formal.Gadgets.swap_fails
#print axioms Formal.Gadgets.digest_reduction_collides
#print axioms Formal.Gadgets.key_from_credential_secret
#print axioms Formal.Gadgets.unbound_key_unsound
#print axioms Formal.Gadgets.inverse_unsat_on_equal
#print axioms Formal.Gadgets.FinOps
#print axioms Formal.Gadgets.owners_distinct
#print axioms Formal.Gadgets.distinct_leaves_not_distinct_persons
#print axioms Formal.Gadgets.neighbours_sound
#print axioms Formal.Gadgets.unsorted_neighbours_unsound
#print axioms Formal.Gadgets.stale_root_passes
#print axioms Formal.Gadgets.distinct_secrets_unsat
#print axioms Formal.Gadgets.common_control_complete
#print axioms Formal.Gadgets.binder_opens_once
#print axioms Formal.Gadgets.visible_value_links
#print axioms Formal.Gadgets.sub_zero_iff_eq
#print axioms Formal.Gadgets.reference_opens_once
#print axioms Formal.Gadgets.two_credential_gap
#print axioms Formal.Gadgets.chain_sound_unsalted
#print axioms Formal.R024.soundness
#print axioms Formal.R024.completeness
#print axioms Formal.R024.members_of_tags
#print axioms Formal.R024.not_minted_refused
#print axioms Formal.R024.batch_over_cap_refused
#print axioms Formal.R024.tick_repeated_refused
#print axioms Formal.R024.distinct_members_not_distinct_people
#print axioms Formal.R024.people_of_members
#print axioms Formal.R024.live_label_not_current_role
#print axioms Formal.R024.rekey_counts_twice

#print axioms Formal.R023.soundness

#print axioms Formal.R023.no_vrc_no_statement

#print axioms Formal.R023.selfVouch_accepts

#print axioms Formal.R023.self_vouch_counted

#print axioms Formal.Gadgets.scope_within_every_ancestor

#print axioms Formal.Gadgets.validity_within_every_ancestor

#print axioms Formal.Gadgets.depth_below

#print axioms Formal.Gadgets.depth_within_every_ancestor

#print axioms Formal.Gadgets.no_decrement_unbounded

#print axioms Formal.Gadgets.leaf_act_all

#print axioms Formal.Gadgets.leaf_valid_all

#print axioms Formal.Chains.linked_of_constraint

#print axioms Formal.Chains.soundness

#print axioms Formal.Chains.r020_soundness

#print axioms Formal.Chains.escalation_unsat

#print axioms Formal.Chains.r021_ceiling_unsat

#print axioms Formal.Chains.r021_soundness

#print axioms Formal.R012.star_to_clique

#print axioms Formal.R012.star_without_binding_not_clique

#print axioms Formal.R011.key_behind_persona

#print axioms Formal.R011.persona_linkage_needed

#print axioms Formal.R010.soundness

#print axioms Formal.R010.self_vouch_unsat
#print axioms Formal.R013.soundness
#print axioms Formal.R013.exchange_safe
#print axioms Formal.R013.commit_frozen
#print axioms Formal.R013.no_fairness
#print axioms Formal.R025.soundness
#print axioms Formal.R025.replacement_fixed
#print axioms Formal.R025.colliding_predigest_two_replacements
#print axioms Formal.R025.second_rotation_refused
#print axioms Formal.R025.rotated_leaf_still_member
#print axioms Formal.R025.rotated_secret_retired
#print axioms Formal.R025.tag_not_nullifier
#print axioms Formal.R025.straddling_epoch_two_nullifiers
#print axioms Formal.R025.next_epoch_one_nullifier
