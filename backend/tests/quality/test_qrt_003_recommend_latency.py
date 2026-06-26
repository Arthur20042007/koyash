"""QRT-003 — /recommend latency (verifies QR-003, Time behaviour).

Scenario under test: under the CI test environment (in-process ASGI client,
fixed catalog, no network/Atlas), /recommend returns a complete response
within 300 ms for at least 95% of 100 sequential requests.
"""

import time

import pytest

P95_BUDGET_MS = 300.0
N_REQUESTS = 100
PAYLOAD = {"budget": "mid", "concerns": ["acne", "dryness", "aging"]}


@pytest.mark.qrt
def test_recommend_p95_latency(client):
    # Warm up so first-call import/JIT costs don't skew the sample.
    client.post("/recommend", json=PAYLOAD)

    latencies_ms = []
    for _ in range(N_REQUESTS):
        start = time.perf_counter()
        r = client.post("/recommend", json=PAYLOAD)
        latencies_ms.append((time.perf_counter() - start) * 1000.0)
        assert r.status_code == 200

    latencies_ms.sort()
    p95 = latencies_ms[int(0.95 * (N_REQUESTS - 1))]
    assert p95 <= P95_BUDGET_MS, (
        f"p95 latency {p95:.1f} ms exceeded budget {P95_BUDGET_MS} ms"
    )
