# app/scripts/my_model.py
import torch
import torch.nn as nn
import torch.nn.functional as F

class Net(nn.Module):
    def __init__(self, num_classes: int = 10):
        super().__init__()
        # 입력: (B, 3, 224, 224)
        self.conv1 = nn.Conv2d(in_channels=3, out_channels=16, kernel_size=3, padding=1)
        # → (B, 16, 224, 224)
        self.pool  = nn.MaxPool2d(kernel_size=2, stride=2)
        # → (B, 16, 112, 112)

        self.conv2 = nn.Conv2d(in_channels=16, out_channels=32, kernel_size=3, padding=1)
        # → (B, 32, 112, 112)
        # 풀링
        # → (B, 32, 56, 56)

        # 완전연결 입력 뉴런 수 = 32 * 56 * 56
        flat_features = 32 * 56 * 56
        self.fc1 = nn.Linear(flat_features, 128)
        # → (B, 128)
        self.fc2 = nn.Linear(128, num_classes)
        # → (B, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = F.relu(self.conv1(x))
        x = self.pool(x)

        x = F.relu(self.conv2(x))
        x = self.pool(x)

        x = torch.flatten(x, 1)  # (B, 32*56*56)
        x = F.relu(self.fc1(x))
        x = self.fc2(x)
        return x
