"""Compatibility entrypoint for offline feature and segmentation training."""
from pipelines.train import run_training

if __name__ == "__main__":
    print(run_training())
