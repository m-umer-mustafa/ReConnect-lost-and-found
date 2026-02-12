"""
Extract blog content from ReConnect Blogs.docx and compare with Blog.tsx
"""
import sys

try:
    from docx import Document
    
    # Read the Word document
    doc = Document("ReConnect Blogs.docx")
    
    print("=" * 80)
    print("CONTENT FROM RECONNECT BLOGS.DOCX")
    print("=" * 80)
    
    for i, para in enumerate(doc.paragraphs):
        if para.text.strip():
            print(f"\n{para.text}")
    
except ImportError:
    print("ERROR: python-docx module is not installed")
    print("Installing python-docx...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "python-docx"])
    print("\nPlease run this script again.")
except Exception as e:
    print(f"Error: {e}")
