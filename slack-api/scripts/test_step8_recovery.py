import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.recovery import parse_cancellation_policy, score_recovery_candidate, enrich_with_groq_or_fallback

def main():
    print("=== TESTING STEP 8: RECOVERY ENGINE & SCORING ===")
    
    # 1. Test parse_cancellation_policy on demo phrases
    print("\n--- Testing Cancellation Policy Parsing ---")
    
    # Demo phrase 1: Non-refundable within 24h of departure
    # Test A: 48h before departure (outside penalty window) -> should be full refund
    r_amt, r_ok = parse_cancellation_policy("Non-refundable within 24h of departure", cost=300.0, hours_before_departure=48.0)
    print(f"Policy: 'Non-refundable within 24h of departure' at 48h prior: refund=${r_amt}, eligible={r_ok}")
    assert r_ok is True and r_amt == 300.0, f"Expected full refund outside penalty window, got {r_amt}, {r_ok}"
    
    # Test B: 12h before departure (inside penalty window) -> should be 0 refund
    r_amt, r_ok = parse_cancellation_policy("Non-refundable within 24h of departure", cost=300.0, hours_before_departure=12.0)
    print(f"Policy: 'Non-refundable within 24h of departure' at 12h prior: refund=${r_amt}, eligible={r_ok}")
    assert r_ok is False and r_amt == 0.0, f"Expected 0 refund inside penalty window, got {r_amt}, {r_ok}"
    
    # Demo phrase 2: Free cancellation until 48 hours prior
    r_amt, r_ok = parse_cancellation_policy("Free cancellation until 48 hours prior", cost=150.0, hours_before_departure=60.0)
    print(f"Policy: 'Free cancellation until 48 hours prior' at 60h prior: refund=${r_amt}, eligible={r_ok}")
    assert r_ok is True and r_amt == 150.0
    
    # Demo phrase 3: Full refund if weather cancels lift operations
    r_amt, r_ok = parse_cancellation_policy("Full refund if weather cancels lift operations", cost=85.0)
    print(f"Policy: 'Full refund if weather cancels lift operations': refund=${r_amt}, eligible={r_ok}")
    assert r_ok is True and r_amt == 85.0
    
    # Demo phrase 4: Standard rail exchange policy
    r_amt, r_ok = parse_cancellation_policy("Standard rail exchange policy", cost=40.0)
    print(f"Policy: 'Standard rail exchange policy': refund=${r_amt}, eligible={r_ok}")
    assert r_ok is True and r_amt == 20.0
    
    # Demo phrase 5: Flexible rebooking ticket with airline fee waiver
    r_amt, r_ok = parse_cancellation_policy("Flexible rebooking ticket with airline fee waiver", cost=250.0)
    print(f"Policy: 'Flexible rebooking ticket with airline fee waiver': refund=${r_amt}, eligible={r_ok}")
    assert r_ok is True and r_amt == 200.0
    
    # 2. Test score_recovery_candidate (pure function)
    print("\n--- Testing Deterministic Scoring Function ---")
    score_rebook, breakdown_rebook = score_recovery_candidate(
        candidate_type="rebook",
        cost_delta=45.0,
        time_delta_minutes=30,
        itinerary_altered_percent=14.3,
        refund_amount=0.0,
        refund_eligible=False,
    )
    print(f"Rebook Score: {score_rebook} / 100")
    print(f"Formula Explanation: {breakdown_rebook.formula_explanation}")
    assert 0 <= score_rebook <= 100
    assert breakdown_rebook.cost_weight == 0.35
    assert breakdown_rebook.time_weight == 0.30
    assert breakdown_rebook.itinerary_weight == 0.20
    assert breakdown_rebook.refund_weight == 0.15
    
    score_drop, breakdown_drop = score_recovery_candidate(
        candidate_type="drop",
        cost_delta=-120.0,
        time_delta_minutes=0,
        itinerary_altered_percent=28.5,
        refund_amount=120.0,
        refund_eligible=True,
        original_cost=120.0,
    )
    print(f"\nDrop Score: {score_drop} / 100")
    print(f"Formula Explanation: {breakdown_drop.formula_explanation}")
    assert 0 <= score_drop <= 100
    
    # 3. Test Groq fallback error-handling
    print("\n--- Testing Groq Fallback Handling ---")
    mock_candidates = [
        {
            "id": "cand-1",
            "candidate_type": "rebook",
            "cost_delta": 45.0,
            "time_delta_minutes": 30,
            "refund_amount": 0.0,
            "score": score_rebook,
            "title": "Rebook LX 356",
            "human_explanation": "Deterministic fallback: Rebook onto Swiss Flight LX 356 preserving destination arrival.",
        }
    ]
    # Call with invalid key / invalid endpoint scenario
    orig_key = os.environ.get("GROQ_API_KEY")
    os.environ["GROQ_API_KEY"] = "invalid_key_for_test"
    try:
        enriched = enrich_with_groq_or_fallback(mock_candidates)
        # Should gracefully return the original candidate without throwing or crashing
        assert len(enriched) == 1
        assert enriched[0]["human_explanation"] == "Deterministic fallback: Rebook onto Swiss Flight LX 356 preserving destination arrival."
        print(f"Fallback survived gracefully: \"{enriched[0]['human_explanation']}\"")
    finally:
        if orig_key:
            os.environ["GROQ_API_KEY"] = orig_key
        else:
            os.environ.pop("GROQ_API_KEY", None)
            
    print("\nSTEP 8 VERIFICATION: PASS")

if __name__ == "__main__":
    main()
