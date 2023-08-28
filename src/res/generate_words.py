import pandas as pd
import re
from functools import reduce

df_canto = pd.read_csv("canto_words.tsv", sep="\t")
df_chars = pd.read_csv("Chars.csv", index_col=0)
df_chars["hakka"] = [[v for v in row if v == v] for row in df_chars[["hakka1", "hakka2"]].values.tolist()]
df_chars = df_chars.explode("hakka")
df_charpron = df_chars.set_index("searchkey")

ROM_MAPPING = {
	"a": "ä",
	"ää": "a",
	"oe": "ö",
	"eo": "ö",
	"yu": "ü",
	"j": "y",
}

def rom_map(jyutping):
	return re.sub("(g|k)u(?!ng|k)", "\\1wu", reduce(lambda str, rule: str.replace(*rule), ROM_MAPPING.items(), jyutping))

def generate(language):
	with open(f"{language.capitalize()}GeneratedWords.csv", "w") as f:
		print("char,pron", file=f)
		for _, row in df_canto.iterrows():
			chars = row["char"]
			prons = rom_map(row["jyutping"]).split()
			if all(char not in df_chars.index
	  			or not isinstance(df_chars.loc[char], pd.DataFrame)
					or df_chars.loc[char][language].nunique() <= 1 for char in chars):
				continue
			roms = []
			for char, pron in zip(chars, prons):
				if (char + pron) not in df_charpron.index:
					break
				rom = df_charpron.loc[char + pron][language]
				if isinstance(rom, str):
					roms.append(rom.strip())
				elif len(rom.unique()) == 1:
					roms.append(rom[0].strip())
				else:
					break
			if len(roms) == len(chars):
				print(f"{chars},{' '.join(roms)}", file=f)

generate("waitau")
generate("hakka")
