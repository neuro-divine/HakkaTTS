# 香港本土語言文字轉語音朗讀器

## Data Preprocessing

**Inputs:** `dictionary.csv`, `public.csv`, `HakkaWords.csv`, `WaitauWords.csv`
**Process:** `compile.py`
**Outputs:** `chars.csv`, `hakka_words.csv`, `waitau_words.csv`

In addition to words from `HakkaWords.csv` and `WaitauWords.csv`, extra words are automatically generated from collocations from the note column of `dictionary.csv` and entries with frequencies ≥ 10 from `public.csv`. Only entries which include at least one polyphone in the target language are included.
