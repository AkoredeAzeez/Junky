#!/usr/bin/env python3
"""
Clean script for the Junky blockchain on-chain code.
This script cleans up build artifacts created by the compile.py script.
"""

import os
import sys
import shutil
from pathlib import Path


def list_build_artifacts(on_chain_dir):
    """List all build artifacts in the on-chain directory."""
    build_dir = on_chain_dir / "build"
    artifacts = []
    
    if build_dir.exists():
        # Add the build directory itself
        artifacts.append(build_dir)
        
        # List the contents of the build directory for reporting
        for item in build_dir.glob("**/*"):
            if item.is_file():
                artifacts.append(item)
    
    return artifacts


def list_script_addresses(on_chain_dir):
    """List script address files."""
    addresses_dir = on_chain_dir / "build" / "addresses"
    addresses = []
    
    if addresses_dir.exists():
        for item in addresses_dir.glob("*.json"):
            if item.is_file():
                addresses.append(item)
    
    return addresses


def clean_build_artifacts(on_chain_dir):
    """Clean all build artifacts from the on-chain directory."""
    build_dir = on_chain_dir / "build"
    
    if build_dir.exists():
        try:
            print(f"Removing build directory: {build_dir}")
            shutil.rmtree(build_dir)
            print("✓ Build directory successfully removed.")
            return True
        except Exception as e:
            print(f"Error removing build directory: {e}")
            return False
    else:
        print("No build directory found. Nothing to clean.")
        return True


def clean_aiken_files(on_chain_dir):
    """Clean Aiken temporary files."""
    # Look for any .aiken cache files
    aiken_caches = list(on_chain_dir.glob("**/.aiken-cache"))
    
    if aiken_caches:
        try:
            for cache in aiken_caches:
                print(f"Removing cache: {cache}")
                if cache.is_dir():
                    shutil.rmtree(cache)
                else:
                    os.remove(cache)
            print("✓ All Aiken cache files removed.")
            return True
        except Exception as e:
            print(f"Error removing Aiken cache files: {e}")
            return False
    else:
        print("No Aiken cache files found.")
        return True


def main():
    """Main function to clean the on-chain build artifacts."""
    # Get the current directory and find on-chain folder
    current_dir = Path(__file__).parent
    on_chain_dir = current_dir / "on-chain"
    
    # Check if on-chain directory exists
    if not on_chain_dir.exists():
        print(f"Error: On-chain directory not found at {on_chain_dir}")
        return 1
    
    print(f"Cleaning Aiken build artifacts in {on_chain_dir}...")
    
    # List artifacts before cleaning
    artifacts = list_build_artifacts(on_chain_dir)
    if artifacts:
        print(f"\nFound {len(artifacts)-1} build artifacts in {artifacts[0]}:")
        for artifact in artifacts[1:]:
            print(f" - {artifact.relative_to(on_chain_dir)}")
    else:
        print("\nNo build artifacts found.")
    
    # List script addresses before cleaning
    addresses = list_script_addresses(on_chain_dir)
    if addresses:
        print(f"\nFound {len(addresses)} script address file(s):")
        for address_file in addresses:
            print(f" - {address_file.relative_to(on_chain_dir)}")
    
    # Clean build artifacts
    build_cleaned = clean_build_artifacts(on_chain_dir)
    
    # Clean Aiken cache files
    cache_cleaned = clean_aiken_files(on_chain_dir)
    
    if build_cleaned and cache_cleaned:
        print("\n✓ Cleanup completed successfully!")
        return 0
    else:
        print("\n⚠ Cleanup completed with some errors.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
