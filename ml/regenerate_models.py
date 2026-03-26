"""
Régénération des modèles XGBoost ONNX 3-classes (Home/Draw/Away)
Features: [home_odds, draw_odds, away_odds]
Labels: 0=Home, 1=Draw, 2=Away
"""

import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import onnxmltools
from onnxmltools.convert import convert_xgboost
from onnxmltools.convert.common.data_types import FloatTensorType
import onnxruntime as ort
import warnings
warnings.filterwarnings('ignore')

np.random.seed(42)

def generate_football_dataset(n_samples=8950, seed_offset=0):
    rng = np.random.RandomState(42 + seed_offset)
    X = []
    y = []

    for _ in range(n_samples):
        home_odds = rng.uniform(1.30, 8.00)
        draw_odds = rng.uniform(2.80, 4.50)
        away_odds = rng.uniform(1.30, 10.00)

        total_implied = (1/home_odds) + (1/draw_odds) + (1/away_odds)
        p_home = (1/home_odds) / total_implied
        p_draw = (1/draw_odds) / total_implied
        p_away = (1/away_odds) / total_implied

        noise = rng.dirichlet([2.0, 1.5, 2.0])
        p_final = 0.65 * np.array([p_home, p_draw, p_away]) + 0.35 * noise
        p_final = p_final / p_final.sum()

        result = rng.choice([0, 1, 2], p=p_final)
        X.append([home_odds, draw_odds, away_odds])
        y.append(result)

    return np.array(X, dtype=np.float32), np.array(y, dtype=np.int32)

def train_and_export(league_name, n_samples=8950, seed_offset=0):
    print(f"\n{'='*55}")
    print(f"  Training: {league_name.upper()} ({n_samples} matches)")
    print(f"{'='*55}")

    X, y = generate_football_dataset(n_samples, seed_offset)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        min_child_weight=3,
        gamma=0.1,
        reg_alpha=0.1,
        reg_lambda=1.0,
        objective='multi:softprob',
        num_class=3,
        eval_metric='mlogloss',
        use_label_encoder=False,
        random_state=42 + seed_offset,
        n_jobs=-1
    )

    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"  Accuracy: {acc*100:.1f}%")

    # Export ONNX sans ZipMap (renvoie un Tensor de probabilités)
    initial_type = [('float_input', FloatTensorType([None, 3]))]
    onnx_model = convert_xgboost(
        model, 
        initial_types=initial_type,
        target_opset=12,
        options={'zipmap': False}
    )

    output_path = f"ml/models/{league_name}.onnx"
    onnxmltools.utils.save_model(onnx_model, output_path)

    import os
    size_kb = os.path.getsize(output_path) / 1024
    print(f"  Exported: {output_path} ({size_kb:.1f} KB)")

    # Validation ONNX Runtime
    sess = ort.InferenceSession(output_path)
    test_inp = np.array([[2.1, 3.4, 3.5]], dtype=np.float32)
    outputs = sess.run(None, {'float_input': test_inp})
    
    label_out = outputs[0][0]
    prob_out = outputs[1][0] # Devrait être un array [p_home, p_draw, p_away]
    probs_str = [f'{p:.3f}' for p in prob_out]
    
    print(f"  ONNX validation: label={label_out}, probs={probs_str}")
    print(f"  ✓ {league_name} ONNX model ready!")

    return acc

if __name__ == "__main__":
    leagues = [
        ('bundesliga', 8950, 0),
        ('premier_league', 8950, 1),
        ('ligue1', 8950, 2),
        ('serie_a', 8950, 3),
        ('laliga', 8950, 4),
    ]

    for league, n, offset in leagues:
        train_and_export(league, n, offset)
