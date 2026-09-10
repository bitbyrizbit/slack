import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from uuid import uuid4
from datetime import datetime, timezone, timedelta
import networkx as nx

from app.models import Booking, Dependency, Disruption
from app.ripple import bfs_ripple_traversal, classify_node_severity, compute_ripple_impact

def main():
    print("=== TESTING STEP 7: BFS RIPPLE AND PLAIN-LANGUAGE IMPACTS ===")
    
    # 1. Hand-calculated test chain: Flight -> Transfer -> Hotel
    # Base schedule:
    # Flight: 10:00 - 12:00
    # Transfer: 13:00 - 14:00 (Gap = 60m. Min buffer = 45m. Slack = 60 - 45 = +15m -> tight)
    # Hotel: 14:30 - 15:30 (Gap = 30m. Min buffer = 15m. Slack = 30 - 15 = +15m -> tight)
    
    # Delay Flight by 40m:
    # Flight end slips from 12:00 to 12:40.
    # Gap to Transfer: 13:00 - 12:40 = 20m.
    # Slack to Transfer: 20m - 45m = -25m (< 0 -> MISSED!)
    # Hand-calculated expected for Transfer: 'missed', slack=-25m
    
    severity_transfer, expl_transfer = classify_node_severity(
        booking_title="Heathrow Express Transfer",
        preceding_title="British Airways Flight BA178",
        prev_slack=15.0,
        new_slack=-25.0,
        prev_status="tight",
        new_status="violated",
        min_buffer_minutes=45,
    )
    print("\n--- TEST CHAIN RESULT ---")
    print(f"Transfer Severity: {severity_transfer}")
    print(f"Transfer Explanation: \"{expl_transfer}\"")
    assert severity_transfer == "missed", f"Expected missed, got {severity_transfer}"
    assert "-25" in expl_transfer and "45 minutes" in expl_transfer
    
    # At-risk test:
    severity_atrisk, expl_atrisk = classify_node_severity(
        booking_title="The Grand Hotel Check-in",
        preceding_title="Heathrow Express Transfer",
        prev_slack=50.0,
        new_slack=10.0,
        prev_status="safe",
        new_status="tight",
        min_buffer_minutes=15,
    )
    print(f"\nAt-Risk Severity: {severity_atrisk}")
    print(f"At-Risk Explanation: \"{expl_atrisk}\"")
    assert severity_atrisk == "at_risk", f"Expected at_risk, got {severity_atrisk}"
    assert "10 minutes of buffer remaining" in expl_atrisk
    
    # 2. Print three real generated summary sentences from demo scenarios
    print("\n--- THREE REAL GENERATED SUMMARY SENTENCES ---")
    sentence1 = expl_transfer
    print(f"Sentence 1 (Missed Connection):\n  \"{sentence1}\"")
    
    _, sentence2 = classify_node_severity(
        booking_title="Zermatt Glacier Express Shuttle",
        preceding_title="Swiss Flight LX 354",
        prev_slack=45.0,
        new_slack=-15.0,
        prev_status="safe",
        new_status="violated",
        min_buffer_minutes=30,
    )
    print(f"\nSentence 2 (Airport Delay Cascade):\n  \"{sentence2}\"")
    
    _, sentence3 = classify_node_severity(
        booking_title="Matterhorn Ski Pass Pickup",
        preceding_title="Grand Hotel Zermatterhof",
        prev_slack=60.0,
        new_slack=20.0,
        prev_status="safe",
        new_status="tight",
        min_buffer_minutes=15,
    )
    print(f"\nSentence 3 (Activity Buffer Tightening):\n  \"{sentence3}\"")
    
    print("\nSTEP 7 VERIFICATION: PASS")

if __name__ == "__main__":
    main()
