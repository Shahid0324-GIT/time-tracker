import random

def generate_r_otp() -> str:
    """
    A utility function to generate random otp string
    """
    return str(random.randint(100000, 999999))