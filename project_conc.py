"""
Project Concatenator - Merges all project source files into a single text file.

Use case: Create a context file to share with AI assistants (Claude, ChatGPT, etc.)
when you need them to understand your entire codebase at once.

Usage: Run the script and enter your project path when prompted.
Output: project_context.txt in the current working directory.
"""

import os


# Builds a single text file containing the readable source of a project tree.
def concatenate_project_code(project_path, output_file_name="project_context.txt", ignore_dirs=None, ignore_extensions=None):
    """
    Concatenates the content of code files in a project directory into a single text file.

    Args:
        project_path (str): The root path of your project.
        output_file_name (str): The name of the output text file.
        ignore_dirs (list): A list of directory names to ignore (e.g., ['venv', '__pycache__']).
        ignore_extensions (list): A list of file extensions to ignore (e.g., ['.txt', '.md']).
    """
    
    # Default directories to skip (version control, dependencies, build artifacts)
    if ignore_dirs is None:
        ignore_dirs = ['.git', '.venv', 'node_modules', '__pycache__', 'dist', 'build', 'docs']
    
    # Default extensions to skip (binaries, media, data files, configs)
    if ignore_extensions is None:
        ignore_extensions = ['.pyc', '.bak', '.log', '.env', '.DS_Store', '.zip', '.tar', '.gz', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.ico', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.bin', '.sqlite3', '.db', '.dat', '.json', '.xml', '.yml', '.yaml', '.csv', '.lock', '.ps1', '.sh', '.bat', '.cmd', '.exe']

    output_file_path = os.path.join(os.getcwd(), output_file_name)

    with open(output_file_path, 'w', encoding='utf-8') as outfile:
        for root, dirs, files in os.walk(project_path):
            # Must modify dirs in-place (slice assignment) for os.walk to skip them
            dirs[:] = [d for d in dirs if d not in ignore_dirs]

            for file in files:
                file_extension = os.path.splitext(file)[1]
                if file_extension not in ignore_extensions:
                    file_path = os.path.join(root, file)
                    relative_file_path = os.path.relpath(file_path, project_path)

                    try:
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            content = infile.read()
                            # Write file header so you can find specific files in the output
                            outfile.write(f"--- File: {relative_file_path} ---\n")
                            outfile.write(content)
                            outfile.write("\n\n")
                        print(f"Processed: {relative_file_path}")
                    except Exception as e:
                        print(f"Could not read {relative_file_path}: {e}")

    print(f"\nAll relevant code has been concatenated into '{output_file_path}'")


# Prompts for a project path when the script is run directly.
if __name__ == "__main__":
    project_directory = input("Enter the path to your project directory (e.g., '.' for current directory): ")
    if not project_directory:
        project_directory = "."

    concatenate_project_code(project_directory)