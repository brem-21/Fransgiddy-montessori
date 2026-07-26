package com.fransgiddy.montessori.excel;

import java.util.List;

public record ImportResult(int created, int updated, int skipped, List<ImportRowError> errors) {}
