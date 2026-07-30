# Hotfix chiavi cast ripetute

## Problema

La storia può avere lo stesso slot `cast` in rami alternativi:

```text
s3_felci     → decision.key = helper
s3_ruscello  → decision.key = helper
```

I due passi non sono attraversabili nello stesso percorso. La chiave rappresenta lo stesso ruolo narrativo e deve produrre lo stesso `slot_key` persistito.

## Regola corretta

- chiavi `branch`: globalmente uniche;
- chiavi `cast`: possono ripetersi in rami alternativi;
- collisioni tra setup e decisioni: sempre vietate.

Non è necessario rinominare `helper`, perché farlo spezzerebbe la semantica dello slot e la persistenza del cast.
