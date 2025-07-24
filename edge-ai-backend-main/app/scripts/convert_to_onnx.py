# scripts/convert_to_onnx.py
import os
import torch
from app.scripts.my_model import Net

def main():
    os.makedirs("models/onnx", exist_ok=True)
    model = Net()
    model.load_state_dict(torch.load("models/pth/latest.pth"))
    model.eval()
    dummy = torch.randn(1, 3, 224, 224)
    torch.onnx.export(
        model, dummy,
        "models/onnx/latest.onnx",
        input_names=["input"], output_names=["output"],
        opset_version=12
    )
    print("ONNX export done.")

if __name__ == "__main__":
    main()
