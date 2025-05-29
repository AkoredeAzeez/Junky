#!/usr/bin/env python3
"""
Compile script for the Junky blockchain on-chain code.
This script compiles the Aiken smart contracts and outputs the results.
"""

import os
import subprocess
import sys
import json
from pathlib import Path
from datetime import datetime


def list_validators(on_chain_dir):
    """List all validator files in the on-chain directory."""
    validators_dir = on_chain_dir / "validators"
    if not validators_dir.exists():
        return []
    
    return list(validators_dir.glob("*.ak"))


def run_aiken_check():
    """Run Aiken type checking."""
    print("\nRunning 'aiken check'...")
    check_result = subprocess.run(["aiken", "check"], check=True, capture_output=True, text=True, shell=True)
    print("✓ Type checking passed")
    return check_result


def run_aiken_build():
    """Run Aiken build to compile the code."""
    print("\nRunning 'aiken build'...")
    build_result = subprocess.run(["aiken", "build"], check=True, capture_output=True, text=True, shell=True)
    
    # Print output
    if build_result.stdout:
        print("\nCompilation output:")
        print(build_result.stdout)
    
    return build_result


def verify_build_artifacts(on_chain_dir):
    """Verify build artifacts and print information about compiled validators."""
    build_dir = on_chain_dir / "build"
    plutus_dir = on_chain_dir / "plutus.json"
    
    if build_dir.exists() and plutus_dir.exists():
        print(f"\n✓ Success! Build artifacts available in {build_dir}")
        
        # Check for generated artifacts
        try:
            with open(plutus_dir, 'r') as f:
                plutus_data = json.load(f)
            
            # Print some information about the compiled contracts
            if plutus_data and "validators" in plutus_data:
                print(f"\nCompiled {len(plutus_data['validators'])} validator(s):")
                for validator in plutus_data["validators"]:
                    print(f" - {validator['title']}")
                    print(f"   Hash: {validator['hash'][:10]}...")
            
            # Save compilation timestamp
            timestamp_file = build_dir / "last_compiled.txt"
            with open(timestamp_file, 'w') as f:
                f.write(f"Last compiled: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            return True
            
        except (json.JSONDecodeError, KeyError) as e:
            print(f"Warning: Could not parse plutus.json: {e}")
            return False
    else:
        print("\nWarning: Build completed but build artifacts not found.")
        return False


def main():
    """Main function to compile on-chain code."""
    # Get the current directory and find on-chain folder
    current_dir = Path(__file__).parent
    on_chain_dir = current_dir / "on-chain"
    
    # Check if on-chain directory exists
    if not on_chain_dir.exists():
        print(f"Error: On-chain directory not found at {on_chain_dir}")
        return 1
    
    # List validators
    validators = list_validators(on_chain_dir)
    if not validators:
        print("Warning: No validator files (*.ak) found in validators directory.")
    else:
        print(f"Found {len(validators)} validator file(s):")
        for v in validators:
            print(f" - {v.name}")
    
    print(f"\nCompiling Aiken code in {on_chain_dir}...")
    
    # Change to the on-chain directory
    os.chdir(on_chain_dir)
    
    try:
        # Run checks and build
        run_aiken_check()
        run_aiken_build()
        
        # Verify build artifacts
        if verify_build_artifacts(on_chain_dir):
            return 0
        else:
            return 1
            
    except subprocess.CalledProcessError as e:
        print(f"\nError during compilation: {e}")
        print("Output:")
        print(e.stdout)
        print("Error:")
        print(e.stderr)
        return 1
    except FileNotFoundError:
        print("\nError: 'aiken' command not found. Make sure Aiken is installed and in your PATH.")
        print("You can install Aiken by following the instructions at https://aiken-lang.org/installation")
        return 1


if __name__ == "__main__":
    sys.exit(main())
