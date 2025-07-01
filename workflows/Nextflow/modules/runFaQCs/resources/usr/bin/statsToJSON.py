#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re
import json
import argparse
import os
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import faqcs_len_histogram


def parse_qc_file(input_path):
    json_dict = {}
    criteria_labels = {}
    after_trimming = False

    with open(input_path, 'rt') as f:
        for line in f:
            line = line.strip()
            if line == "After Trimming":
                after_trimming = True
            m = re.search(r': ([\d.]+)', line)
            if m:
                if line.startswith("Reads #") and not after_trimming:
                    json_dict["inputReads"] = m.group(1)
                elif line.startswith("Total bases") and not after_trimming:
                    json_dict["inputBases"] = m.group(1)
                elif line.startswith("Reads Length") and not after_trimming:
                    json_dict["inputReadLength"] = m.group(1)
                elif line.startswith("Reads #") and after_trimming:
                    json_dict["outputReads"] = m.group(1)
                elif line.startswith("Total bases") and after_trimming:
                    json_dict["outputBases"] = m.group(1)
                elif line.startswith("Mean Reads Length") and after_trimming:
                    json_dict["outputReadLength"] = m.group(1)
                elif line.startswith("Paired Reads #"):
                    json_dict["outputPairedReads"] = m.group(1)
                elif line.startswith("Paired total bases"):
                    json_dict["outputPairedBases"] = m.group(1)
                elif line.startswith("Unpaired Reads #"):
                    json_dict["outputUnpairedReads"] = m.group(1)
                elif line.startswith("Unpaired total bases"):
                    json_dict["outputUnpairedBases"] = m.group(1)
                elif line.startswith("Discarded reads #"):
                    json_dict["filteredTotalReads"] = m.group(1)
                elif line.startswith("Trimmed bases"):
                    json_dict["trimmedTotalBases"] = m.group(1)
                elif "Reads Filtered by length" in line:
                    cutoff = re.search(r'cutoff \((.*?)\)', line)
                    label = f"Length < {cutoff.group(1)}" if cutoff else "Length Filtered"
                    criteria_labels["lenFilteredReads"] = label
                    json_dict["lenFilteredReads"] = m.group(1)
                elif "Bases Filtered by length" in line:
                    json_dict["lenFilteredBases"] = m.group(1)
                elif "Reads Filtered by continuous" in line:
                    count = re.search(r'"N" \((.*?)\)', line)
                    label = f'Continuous "N" ≥ {count.group(1)}' if count else 'Continuous N Filtered'
                    criteria_labels["nFilteredReads"] = label
                    json_dict["nFilteredReads"] = m.group(1)
                elif "Bases Filtered by continuous" in line:
                    json_dict["nFilteredBases"] = m.group(1)
                elif "Reads Filtered by low complexity" in line:
                    ratio = re.search(r'ratio \((.*?)\)', line)
                    label = f"Low Complexity > {ratio.group(1)}" if ratio else "Low Complexity Filtered"
                    criteria_labels["lcFilteredReads"] = label
                    json_dict["lcFilteredReads"] = m.group(1)
                elif "Bases Filtered by low complexity" in line:
                    json_dict["lcFilteredBases"] = m.group(1)
                elif "Reads Trimmed by quality" in line:
                    cutoff = re.search(r'quality \((.*?)\)', line)
                    label = f"Quality < {cutoff.group(1)}" if cutoff else "Quality Trimmed"
                    criteria_labels["qualTrimmedReads"] = label
                    json_dict["qualTrimmedReads"] = m.group(1)
                elif "Bases Trimmed by quality" in line:
                    json_dict["qualTrimmedBases"] = m.group(1)

    return json_dict, criteria_labels

def create_qc_plot(json_dict, criteria_labels, output_html):
    fig = make_subplots(rows=1, cols=2, subplot_titles=(
        "Reads Before and After Trimming",
        "Discarded Reads Breakdown with Cutoffs"
    ),column_widths=[0.35, 0.65])

    # Bar 1: Reads
    if 'outputPairedReads' in json_dict:
        # If paired and unpaired reads are available, use them
        x_vals = ["Before Trimming", "After Trimming - Paired", "After Trimming - Unpaired"]
        y_vals = [int(json_dict["inputReads"]),
                  int(json_dict.get("outputPairedReads", 0)),
                  int(json_dict.get("outputUnpairedReads", 0))]
        bar1_hover_text = [f'{json_dict["inputBases"]} bases<br>Avg Length: {json_dict.get("inputReadLength", "N/A")} bp',
                           f'{json_dict.get("outputPairedBases", 0)} bases',
                           f'{json_dict.get("outputUnpairedBases", 0)} bases']
    else:
        # If paired reads are not available, use total output reads
        x_vals = ["Before Trimming", "After Trimming"]
        y_vals = [int(json_dict["inputReads"]),
                  int(json_dict.get("outputReads", 0))]
        bar1_hover_text = [f'{json_dict["inputBases"]} bases<br>Avg Length: {json_dict.get("inputReadLength", "N/A")} bp',
                           f'{json_dict.get("outputBases", 0)} bases<br>Avg Length: {json_dict.get("outputReadLength", "N/A")} bp',]
    
    fig.add_trace(go.Bar(
        x=x_vals,
        y=y_vals,
        customdata=bar1_hover_text,
        hovertemplate="<br>".join([
                            "Reads: %{y}",
                            "Bases: %{customdata}"]) + "<extra></extra>",
        name="Reads Count"
    ), row=1, col=1)

    # Bar 2: Filters
    discard_keys = ["lenFilteredReads", "nFilteredReads", "lcFilteredReads", "qualTrimmedReads"]
    x_vals = [criteria_labels[k] for k in discard_keys]
    y_vals = [int(json_dict[k]) for k in discard_keys]
    hover_texts = [f'{int(float(json_dict.get(k.replace("Reads", "Bases"), 0)))} bases' for k in discard_keys]

    fig.add_trace(go.Bar(
        x=x_vals,
        y=y_vals,
        customdata=hover_texts,
        hovertemplate="<br>".join([
                            "Reads: %{y}",
                            "Bases: %{customdata}"]) + "<extra></extra>",
        name="Filtered Reads"
    ), row=1, col=2)

    fig.update_layout(
        title_text="QC Summary Plots",
        showlegend=False,
        xaxis2_title="Filter Criteria with Cutoffs"
    )

    fig.write_html(output_html)

def merge_html_plots(summary_path, histogram_path, output_path="final.html"):
    with open(summary_path, "r") as f:
        summary_html = f.read()
    with open(histogram_path, "r") as f:
        histogram_html = f.read()

    def extract_body_content(html):
        match = re.search(r"<body.*?>(.*)</body>", html, re.DOTALL)
        return match.group(1).strip() if match else html

    summary_content = extract_body_content(summary_html)
    histogram_content = extract_body_content(histogram_html)

    final_html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>QC Report</title>
    <style>
        details {{
            margin-bottom: 20px;
            border: 1px solid #ccc;
            padding: 10px;
            border-radius: 4px;
        }}
        summary {{
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
        }}
    </style>
</head>
<body>
    <details open>
        <summary>QC Summary Plots</summary>
        {summary_content}
    </details>

    <details open>
        <summary>Length Histogram Plots</summary>
        {histogram_content}
    </details>
</body>
</html>
"""
    with open(output_path, "w") as f:
        f.write(final_html)
    print(f"[✓] Final merged report saved to: {output_path}")

def main(): 
    parser = argparse.ArgumentParser(description="Parse QC stats and generate plots.")
    parser.add_argument("input_file", help="Path to the QC.stats file")
    parser.add_argument("--json_out", default="QC.stats.json", help="Path to output JSON summary")
    parser.add_argument("--html_out", default="QC_summary_plots.html", help="Path to output HTML plot")
    parser.add_argument("--hist_out", default="QC_length_histogram.html", help="Path to output length histogram plot")
    parser.add_argument("--final_out", default="QC_final_report.html", help="Path to merged final HTML output")


    args = parser.parse_args()

    json_dict, criteria_labels = parse_qc_file(args.input_file)

    # Write JSON
    with open(args.json_out, 'w') as f:
        json.dump(json_dict, f, indent=2)

    # Generate plot
    create_qc_plot(json_dict, criteria_labels, args.html_out)

    # Check for histogram inputs
    qc_stats_dir = os.path.dirname(os.path.abspath(args.input_file))
    hist1_path = os.path.join(qc_stats_dir, "qa.QC.length_count.txt")
    hist2_path = os.path.join(qc_stats_dir, "QC.length_count.txt")
    if not (os.path.exists(hist1_path) and os.path.exists(hist2_path)):
        print(f"Skipping histogram generation: required files '{hist1_path}' or '{hist2_path}' not found.")

    qa_bar, qa_annot, _ = faqcs_len_histogram.length_histogram(hist1_path, "Input Length", "Count (millions)")
    main_bar, main_annot, _ = faqcs_len_histogram.length_histogram(hist2_path, "Trimmed Length", "Count (millions)")
    hist_fig = faqcs_len_histogram.combine_length_histogram(qa_bar, main_bar, qa_annot, main_annot)
    hist_fig.write_html(args.hist_out)
    
    if os.path.exists(args.hist_out):
        merge_html_plots(args.html_out, args.hist_out, args.final_out)

if __name__ == "__main__":
    main()